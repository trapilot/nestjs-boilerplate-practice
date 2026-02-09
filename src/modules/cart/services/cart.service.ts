import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { EnumCartStatus, Prisma, Product } from '@runtime/prisma-client'
import { AppUtil, HelperService } from 'lib/nest-core'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { MemberService } from 'modules/member/services/member.service'
import { ProductService } from 'modules/product/services/product.service'
import { CartUtil } from '../helpers/cart.util'
import {
  ICartCheckoutResult,
  ICartItemAddOptions,
  ICartSnapshot,
  TCart,
  TCartItem,
} from '../interfaces/cart.interface'
import { CartItemInStockRule } from '../rules/cart.item-in-stock.rule'
import { CartItemIsActiveRule } from '../rules/cart.item-is-active.rule'

@Injectable()
export class CartService {
  private readonly cartRelation: Prisma.CartInclude = {
    items: {
      include: {
        product: true,
      },
    },
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly memberService: MemberService,
    private readonly productService: ProductService,
  ) {}

  async getList(
    kwargs: Prisma.CartFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.cart.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.CartFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.cart.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.CartFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TCart> {
    return await this.prisma.cart
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.cart.notFound',
        })
      })
  }

  async abandon(id: number): Promise<TCart> {
    return await this.prisma.cart.update({
      where: { id },
      data: {
        status: EnumCartStatus.ABANDONED,
      },
    })
  }

  async checkout(memberId: number, version: number): Promise<ICartCheckoutResult> {
    const { cart, summary } = await this.validateForCheckout(memberId, version)

    // snapshot
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        status: EnumCartStatus.SAVED,
        price: summary.price,
        point: summary.point,
        shipping: summary.shipping,
        tax: summary.tax,
      },
    })

    return {
      cartId: cart.id,
      items: cart.items,
      summary,
    }
  }

  async validateCart(cart: TCart): Promise<{ cart: TCart; summary: ICartSnapshot }> {
    if (cart.items.length === 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'module.cart.isEmpty',
      })
    }

    const summary = CartUtil.calculate(cart.items)

    await this.memberService.checkPointBalance(cart.memberId, summary.point, cart.updatedAt)

    const ruler = AppUtil.initializeRuler<TCartItem>([
      new CartItemIsActiveRule(),
      new CartItemInStockRule(),
    ])

    for (const item of cart.items) {
      await ruler.validate(item)
    }

    return { cart, summary }
  }

  async validateForCheckout(
    memberId: number,
    version: number,
  ): Promise<{ cart: TCart; summary: ICartSnapshot }> {
    const cart = await this.validateActiveCart(memberId, version)

    return await this.validateCart(cart)
  }

  async getValidatedCart(id: number): Promise<{ cart: TCart; summary: ICartSnapshot }> {
    const cart = await this.prisma.cart.findUnique({
      where: { id, status: EnumCartStatus.SAVED },
      include: this.cartRelation,
    })

    return this.validateCart(cart)
  }

  async getOrCreateActiveCart(memberId: number): Promise<TCart> {
    const cart = await this.prisma.cart.findFirst({
      where: { memberId, status: EnumCartStatus.ACTIVE },
      include: this.cartRelation,
    })

    if (cart) {
      return cart
    }

    return this.prisma.cart.create({
      data: { memberId, status: EnumCartStatus.ACTIVE },
      include: this.cartRelation,
    })
  }

  async validateActiveCart(memberId: number, version: number): Promise<TCart> {
    const cart = await this.prisma.cart.findFirst({
      where: { memberId, status: EnumCartStatus.ACTIVE, version },
      include: this.cartRelation,
    })

    if (!cart) {
      // Logic: If version doesn't match, the cart state changed elsewhere.
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: 'module.cart.versionChanged',
      })
    }
    return cart
  }

  async addItem(memberId: number, item: ICartItemAddOptions): Promise<TCart> {
    const cart = await this.getOrCreateActiveCart(memberId)
    const product = await this.productService.findOrFail(item.productId)

    return this.prisma.$transaction(async tx => {
      const existing = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: product.id,
          },
        },
      })

      if (existing) {
        return this.applyQuantity(cart.id, existing.id, existing.quantity + item.quantity)
      }

      return tx.cart.update({
        where: { id: cart.id },
        include: this.cartRelation,
        data: {
          version: { increment: 1 },
          items: {
            create: {
              promotionId: item?.promotionId,
              bundleId: item?.bundleId,
              vendorId: product.vendorId,
              offerId: item?.offerId,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: product.salePrice,
              unitPoint: product.salePoint,
              discPrice: 0,
              discPoint: 0,
              finalPrice: product.salePrice,
              finalPoint: product.salePoint,
            },
          },
        },
      })
    })
  }

  async removeItem(memberId: number, itemId: number): Promise<TCart> {
    const cart = await this.getOrCreateActiveCart(memberId)
    return this.applyQuantity(cart.id, itemId, 0)
  }

  async adjustItem(memberId: number, itemId: number, quantity: number): Promise<TCart> {
    const cart = await this.getOrCreateActiveCart(memberId)
    return this.applyQuantity(cart.id, itemId, quantity)
  }

  async checkSalePerPerson(memberId: number, product: Product): Promise<boolean> {
    if (product.salePerPerson <= 0) {
      return true
    }
    const salePerPerson = await this.productService.getSalePerPerson(product.id, memberId)
    return salePerPerson < product.salePerPerson
  }

  private async applyQuantity(cartId: number, itemId: number, quantity: number): Promise<TCart> {
    if (quantity <= 0) {
      return this.prisma.cart.update({
        where: { id: cartId },
        include: this.cartRelation,
        data: {
          version: { increment: 1 },
          items: { delete: { id: itemId } },
        },
      })
    }

    const item = await this.prisma.cartItem.findFirstOrThrow({ where: { id: itemId, cartId } })
    const recalculated = CartUtil.recalculate(item, quantity)

    return this.prisma.cart.update({
      where: { id: cartId },
      include: this.cartRelation,
      data: {
        version: { increment: 1 },
        items: { update: { where: { id: itemId }, data: recalculated } },
      },
    })
  }
}
