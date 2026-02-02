import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  EnumInvoiceStatus,
  EnumOrderStatus,
  EnumPointAction,
  EnumPointSource,
  EnumRedemptionSource,
  EnumRedemptionStatus,
  EnumSlipType,
  Prisma,
} from '@runtime/prisma-client'
import { EnumDateFormat, HelperService } from 'lib/nest-core'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TCart } from 'modules/cart/interfaces/cart.interface'
import { CartService } from 'modules/cart/services/cart.service'
import { InvoiceService } from 'modules/invoice/services/invoice.service'
import { MemberService } from 'modules/member/services/member.service'
import { IOrderPlaceOptions, TOrder } from '../interfaces/order.interface'

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly cartService: CartService,
    private readonly memberService: MemberService,
    private readonly invoiceService: InvoiceService,
  ) {}

  async findOne(kwargs?: Prisma.OrderFindUniqueArgs): Promise<TOrder> {
    return await this.prisma.order.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.OrderFindFirstArgs = {}): Promise<TOrder> {
    return await this.prisma.order.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.OrderFindManyArgs = {}): Promise<TOrder[]> {
    return await this.prisma.order.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.OrderFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TOrder> {
    const order = await this.prisma.order
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.order.notFound',
        })
      })
    return order
  }

  async matchOrFail(
    where: Prisma.OrderWhereInput,
    kwargs: Omit<Prisma.OrderFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TOrder> {
    const order = await this.prisma.order
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.order.notFound',
        })
      })
    return order
  }

  async differOrFail(
    where: Prisma.OrderWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.order.conflict',
      })
    }
  }

  async list(
    where?: Prisma.OrderWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.order.list(where, params, options)
  }

  async paginate(
    where?: Prisma.OrderWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.order.paginate(where, params, options)
  }

  async count(where?: Prisma.OrderWhereInput): Promise<number> {
    return await this.prisma.order.count({
      where,
    })
  }

  async find(id: number, kwargs: Omit<Prisma.OrderFindUniqueArgs, 'where'> = {}): Promise<TOrder> {
    return await this.prisma.order.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.OrderUncheckedCreateInput): Promise<TOrder> {
    const order = await this.prisma.order.create({
      data,
    })
    return order
  }

  async update(id: number, data: Prisma.OrderUncheckedUpdateInput): Promise<TOrder> {
    const order = await this.findOrFail(id)

    return await this.prisma.order.update({
      data,
      where: { id: order.id },
    })
  }

  async delete(order: TOrder, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.order.delete({ where: { id: order.id } })
      })
      return true
    } catch {
      return false
    }
  }

  private calculateTotals(cart: TCart): { finalPrice: number; finalPoint: number } {
    let finalPrice = 0
    let finalPoint = 0

    for (const item of cart.items) {
      finalPrice += item.product.salePrice * item.quantity
      finalPoint += item.product.salePoint * item.quantity
    }

    return { finalPrice, finalPoint }
  }

  private async validateMemberPoint(
    memberId: number,
    requirePoint: number,
    issuedAt: Date,
  ): Promise<number> {
    const pointBalance = await this.memberService.getPointBalance(memberId, issuedAt)
    if (requirePoint > pointBalance) {
      throw new BadRequestException({
        statusCode: HttpStatus.CONFLICT,
        message: 'module.member.notEnoughPoint',
      })
    }

    return pointBalance
  }

  async createFromCart(cartId: number, options: IOrderPlaceOptions): Promise<TOrder> {
    const nowDate = this.helperService.dateNow()
    const endOfDay = this.helperService.dateCreate(nowDate, { endOfDay: true })

    const cart = await this.cartService.validateForCheckout(cartId)

    const { finalPrice, finalPoint } = this.calculateTotals(cart)

    await this.validateMemberPoint(cart.memberId, finalPoint, nowDate)

    const orderNumber = await this.generateOrderNumber(nowDate)
    const invoiceNumber = await this.invoiceService.generateInvoiceNumber(nowDate)
    const recentPoints = await this.memberService.getPointRecents(cart.memberId, {
      pointRequire: finalPoint,
      untilDate: nowDate,
    })

    const hasShipment = !!cart.items.find(item => item.product.hasShipment)
    const duePaidDays = cart.items
      .filter(item => item.product.hasDuePayment && item.product.duePaidDays > 0)
      .map(item => item.product.duePaidDays)

    const dueDate = duePaidDays.length
      ? this.helperService.dateForward(endOfDay, { days: Math.min(...duePaidDays) })
      : undefined

    const [order] = await this.prisma.$transaction([
      this.prisma.order.create({
        data: {
          memberId: cart.memberId,
          finalPrice,
          finalPoint,
          code: orderNumber,
          source: options.source,
          status: EnumOrderStatus.PENDING,
          issuedAt: nowDate,
          createdAt: nowDate,
          updatedAt: nowDate,
          shipment: {
            create: hasShipment
              ? {
                  address: options.shipment.address,
                  phone: options.shipment.phone,
                  note: options.shipment.note,
                }
              : undefined,
          },
          invoice: {
            create: {
              code: invoiceNumber,
              memberId: cart.memberId,
              paidPrice: 0,
              paidPoint: finalPoint,
              finalPrice: finalPrice,
              finalPoint: finalPoint,
              status: EnumInvoiceStatus.PARTIALLY_PAID,
              dueDate: dueDate,
              issuedAt: nowDate,
              createdAt: nowDate,
              updatedAt: nowDate,
              points: {
                createMany: {
                  data: recentPoints.map(recentPoint => {
                    return {
                      memberId: cart.memberId,
                      tierId: cart.member.tierId,
                      invoiceAmount: finalPrice,
                      source: EnumPointSource.PURCHASE,
                      action: EnumPointAction.DEDUCT,
                      point: recentPoint.point * -1,
                      expiryDate: recentPoint.date,
                      createdAt: nowDate,
                      updatedAt: nowDate,
                    }
                  }),
                },
              },
            },
          },
          items: {
            createMany: {
              data: cart.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.product.salePrice,
                unitPoint: item.product.salePoint,
                finalPrice: item.quantity * item.product.salePrice,
                finalPoint: item.quantity * item.product.salePoint,
                createdAt: nowDate,
                updatedAt: nowDate,
              })),
              skipDuplicates: true,
            },
          },
          redemptions: {
            createMany: {
              data: cart.items.flatMap(item =>
                Array.from({ length: item.quantity }, () => ({
                  memberId: cart.memberId,
                  productId: item.productId,
                  redeemPrice: item.product.salePrice,
                  redeemPoint: item.product.salePoint,
                  source: EnumRedemptionSource.ORDER,
                  status: EnumRedemptionStatus.PENDING,
                  issuedAt: nowDate,
                  createdAt: nowDate,
                  updatedAt: nowDate,
                })),
              ),
              skipDuplicates: true,
            },
          },
        },
      }),
      this.prisma.cart.update({
        where: { id: cart.id },
        data: {
          version: 1,
          createdAt: nowDate,
          updatedAt: nowDate,
          items: {
            deleteMany: {},
          },
          member: {
            update: {
              pointBalance: { decrement: finalPoint },
              updatedAt: nowDate,
            },
          },
        },
      }),
      ...cart.items.map(item =>
        this.prisma.product.update({
          where: { id: item.productId },
          data: { unpaidQty: { increment: item.quantity } },
        }),
      ),
    ])
    return order
  }

  async generateOrderNumber(issuedAt: Date): Promise<string> {
    const key = this.helperService.dateFormat(issuedAt, EnumDateFormat.DATE_REFERENCE)
    const type = EnumSlipType.ORDER
    const slip = await this.prisma.slipCounter.upsert({
      where: { type_key: { key, type } },
      create: { type, key, sequence: 1 },
      update: { sequence: { increment: 1 } },
    })

    const raw = `${process.env.APP_SECRET_KEY}:${type}:${key}:${slip.sequence}`
    const hash = this.helperService.hashCreate(raw, { algorithm: 'sha256' })
    const code = this.helperService.baseEncode(hash, 36)

    return this.helperService.stringFormat(code, {
      length: 16,
      format: 'uppercase',
      slices: { delimiter: '-', parts: [4, 4, 4, 4] },
    })
  }

  async onCreated(_order: TOrder): Promise<void> {}
}
