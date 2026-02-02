import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma, Product } from '@runtime/prisma-client'
import { AppUtil, HelperService } from 'lib/nest-core'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { ProductService } from 'modules/product/services/product.service'
import { CartUtil } from '../helpers/cart.util'
import { ICartItemAddOptions, TCart, TCartItem } from '../interfaces/cart.interface'
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
  private readonly cartUpVersion: Prisma.IntFieldUpdateOperationsInput = {
    increment: AppUtil.isLocal() ? 0 : 1,
  }
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly productService: ProductService,
  ) {}

  async findOne(kwargs?: Prisma.CartFindUniqueArgs): Promise<TCart> {
    return await this.prisma.cart.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.CartFindFirstArgs = {}): Promise<TCart> {
    return await this.prisma.cart.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.CartFindManyArgs = {}): Promise<TCart[]> {
    return await this.prisma.cart.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.CartFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TCart> {
    const cart = await this.prisma.cart
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.cart.notFound',
        })
      })
    return cart
  }

  async matchOrFail(
    where: Prisma.CartWhereInput,
    kwargs: Omit<Prisma.CartFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TCart> {
    const cart = await this.prisma.cart
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.cart.notFound',
        })
      })
    return cart
  }

  async differOrFail(
    where: Prisma.CartWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.cart.conflict',
      })
    }
  }

  async list(
    where?: Prisma.CartWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.cart.list(where, params, options)
  }

  async paginate(
    where?: Prisma.CartWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.cart.paginate(where, params, options)
  }

  async count(where?: Prisma.CartWhereInput): Promise<number> {
    return await this.prisma.cart.count({
      where,
    })
  }

  async find(id: number, kwargs: Omit<Prisma.CartFindUniqueArgs, 'where'> = {}): Promise<TCart> {
    return await this.prisma.cart.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.CartUncheckedCreateInput): Promise<TCart> {
    const cart = await this.prisma.cart.create({
      data,
      include: this.cartRelation,
    })
    return cart
  }

  async update(id: number, data: Prisma.CartUncheckedUpdateInput): Promise<TCart> {
    const cart = await this.findOrFail(id)

    return await this.prisma.cart.update({
      data,
      include: this.cartRelation,
      where: { id: cart.id },
    })
  }

  async delete(cart: TCart, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.cart.delete({ where: { id: cart.id } })
      })
      return true
    } catch {
      return false
    }
  }

  async checkout(id: number): Promise<TCart> {
    return await this.validateForCheckout(id)
  }

  async validateForCheckout(id: number): Promise<TCart> {
    const cart = await this.findOrFail(id, {
      include: {
        member: true,
        items: {
          include: { product: true },
        },
      },
    })

    if (cart.items.length === 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'module.cart.isEmpty',
      })
    }

    const ruler = AppUtil.initializeRuler<TCartItem>([
      new CartItemIsActiveRule(),
      new CartItemInStockRule(),
    ])

    for (const item of cart.items) {
      await ruler.validate(item)
    }

    return cart
  }

  async handleCheckoutSuccess(_cart: TCart): Promise<void> {}

  async reset(memberId: number): Promise<TCart> {
    const exists = await this.count({ memberId })
    if (exists > 0) {
      return await this.prisma.cart.update({
        where: { memberId },
        data: { version: 1 },
        include: this.cartRelation,
      })
    }
    return await this.create({ memberId, version: 1 })
  }

  async getCartData(memberId: number): Promise<TCart> {
    return await this.findOne({
      where: { memberId },
      include: this.cartRelation,
    })
  }

  async getCartItem(kwargs: Prisma.CartItemFindUniqueOrThrowArgs): Promise<TCartItem> {
    const cartItem = await this.prisma.cartItem
      .findUniqueOrThrow({ ...kwargs })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.cart.notFoundItem',
        })
      })
    return cartItem
  }

  async getOrCreate(memberId: number): Promise<TCart> {
    const exists = await this.count({ memberId })
    if (exists > 0) {
      return await this.getCartData(memberId)
    }
    return await this.create({ memberId, version: 1 })
  }

  async validate(memberId: number, version: number): Promise<TCart> {
    const exists = await this.prisma.cart.count({ where: { memberId, version } })
    if (exists === 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'module.cart.versionChanged',
      })
    }
    return await this.getCartData(memberId)
  }

  async addItem(cart: TCart, item: ICartItemAddOptions): Promise<TCart> {
    const product = await this.productService.findOrFail(item.productId)
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: item.productId,
        },
      },
    })

    if (cartItem) {
      return await this.adjustItem(cart, cartItem, cartItem.quantity + item.quantity)
    }

    return await this.prisma.cart.update({
      where: { id: cart.id },
      include: this.cartRelation,
      data: {
        version: this.cartUpVersion,
        items: {
          create: {
            promotionId: item?.promotionId,
            bundleId: item?.bundleId,
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
  }

  async removeItem(cart: TCart, cartItem: TCartItem): Promise<TCart> {
    const [_, cartItems] = await this.prisma.$transaction([
      this.prisma.cartItem.delete({
        where: { cartId: cart.id, id: cartItem.id },
      }),
      this.prisma.cart.update({
        where: { id: cart.id },
        include: this.cartRelation,
        data: { version: this.cartUpVersion },
      }),
    ])
    return cartItems
  }

  async adjustItem(cart: TCart, cartItem: TCartItem, quantity: number): Promise<TCart> {
    const { id: _id, cartId: _cartId, ...data } = CartUtil.recalculate(cartItem, quantity)
    return await this.prisma.cart.update({
      where: { id: cart.id },
      include: this.cartRelation,
      data: {
        version: this.cartUpVersion,
        items: {
          update: {
            where: { id: cartItem.id },
            data,
          },
        },
      },
    })
  }

  async checkSalePerPerson(memberId: number, product: Product): Promise<boolean> {
    if (product.salePerPerson <= 0) {
      return true
    }
    const salePerPerson = await this.productService.getSalePerPerson(product.id, memberId)
    return salePerPerson < product.salePerPerson
  }
}
