import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { Prisma, Product } from '@prisma/client'
import { AppHelper, DateService } from 'lib/nest-core'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { MemberService } from 'modules/member/services'
import { OrderService } from 'modules/order/services'
import { ProductService } from 'modules/product/services'
import { CartUtil, CartValidator } from '../helpers'
import { ICartCheckoutOptions, ICartItemAddOptions, TCart, TCartItem } from '../interfaces'
import { CartItemInStockRule, CartItemIsActiveRule, CartItemMemberRequireRule } from '../rules'

@Injectable()
export class CartService implements OnModuleInit {
  private readonly cartRelation: Prisma.CartInclude = {
    items: {
      include: {
        product: true,
      },
    },
  }
  private readonly cartUpVersion: Prisma.IntFieldUpdateOperationsInput = {
    increment: AppHelper.isDevelopment() ? 0 : 1,
  }

  private memberService: MemberService
  private orderService: OrderService
  private productService: ProductService

  constructor(
    private readonly ref: ModuleRef,
    private readonly prisma: PrismaService,
    private readonly dateService: DateService,
  ) {}

  onModuleInit() {
    this.memberService = this.ref.get(MemberService, { strict: false })
    this.orderService = this.ref.get(OrderService, { strict: false })
    this.productService = this.ref.get(ProductService, { strict: false })
  }

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
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.cart.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.CartWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.cart.paginate(where, params, options)
    })
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
      await this.prisma.$transaction(async (tx) => {
        await tx.cart.delete({ where: { id: cart.id } })
      })
      return true
    } catch {
      return false
    }
  }

  async checkout(id: number, options: ICartCheckoutOptions): Promise<TCart> {
    const dateNow = this.dateService.create()
    const issuedAt = options?.dateDebug || dateNow

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

    const cartValidator = new CartValidator([
      new CartItemIsActiveRule(),
      new CartItemInStockRule(),
      new CartItemMemberRequireRule(this, cart.memberId, issuedAt),
    ])

    for (const item of cart.items) {
      await cartValidator.validate(item)
    }

    await this.orderService.createOrder(cart, {
      source: options.source,
      issuedAt: issuedAt,
      shipment: {
        address: options.shipment.address,
        phone: options.shipment.phone,
        note: options.shipment?.note,
      },
    })

    const cartReset = await this.findOrFail(id, {
      include: this.cartRelation,
    })
    return cartReset
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

  async checkPointRequire(
    memberId: number,
    pointRequire: number,
    issuedAt: Date,
  ): Promise<boolean> {
    const pointBalance = await this.memberService.getPointBalance(memberId, issuedAt)
    return pointRequire <= pointBalance
  }

  async checkSalePerPerson(memberId: number, product: Product): Promise<boolean> {
    if (product.salePerPerson <= 0) return true
    const salePerPerson = await this.productService.getSalePerPerson(product.id, memberId)
    return salePerPerson < product.salePerPerson
  }
}
