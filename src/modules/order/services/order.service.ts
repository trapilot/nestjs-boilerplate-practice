import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import {
  ENUM_INVOICE_STATUS,
  ENUM_ORDER_STATUS,
  ENUM_POINT_TYPE,
  ENUM_REDEMPTION_SOURCE,
  ENUM_REDEMPTION_STATUS,
  Prisma,
} from '@prisma/client'
import { HelperService } from 'lib/nest-core'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { TCart } from 'modules/cart/interfaces'
import { InvoiceService } from 'modules/invoice/services'
import { MemberService } from 'modules/member/services'
import { IOrderPlaceOptions, TOrder } from '../interfaces'

@Injectable()
export class OrderService implements OnModuleInit {
  private memberService: MemberService
  private invoiceService: InvoiceService

  constructor(
    private readonly ref: ModuleRef,
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {}

  onModuleInit() {
    this.memberService = this.ref.get(MemberService, { strict: false })
    this.invoiceService = this.ref.get(InvoiceService, { strict: false })
  }

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
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.order.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.OrderWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.order.paginate(where, params, options)
    })
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
      await this.prisma.$transaction(async (tx) => {
        await tx.order.delete({ where: { id: order.id } })
      })
      return true
    } catch {
      return false
    }
  }

  async createOrder(cart: TCart, options: IOrderPlaceOptions): Promise<TOrder> {
    let finalPrice = 0
    let finalPoint = 0
    for (const item of cart.items) {
      finalPrice += item.product.salePrice * item.quantity
      finalPoint += item.product.salePoint * item.quantity
    }

    let pointBalance = await this.memberService.getPointBalance(cart.memberId, options.issuedAt)
    if (finalPoint > pointBalance) {
      throw new BadRequestException({
        statusCode: HttpStatus.CONFLICT,
        message: 'module.member.notEnoughPoint',
      })
    }

    const endOfDay = this.helperService.dateCreate(options.issuedAt, { endOfDay: true })
    const orderNumber = await this.memberService.getOrderNumber(options.issuedAt)
    const invoiceNumber = await this.memberService.getInvoiceNumber(options.issuedAt)
    const recentPoints = await this.memberService.getPointRecents(cart.memberId, finalPoint)

    const hasShipment = !!cart.items.find((item) => item.product.hasShipment)
    const duePaidDays = cart.items
      .filter((item) => item.product.hasDuePayment && item.product.duePaidDays > 0)
      .map((item) => item.product.duePaidDays)

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
          status: ENUM_ORDER_STATUS.PENDING,
          issuedAt: options.issuedAt,
          createdAt: options.issuedAt,
          updatedAt: options.issuedAt,
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
              status: ENUM_INVOICE_STATUS.PARTIALLY_PAID,
              dueDate: dueDate,
              issuedAt: options.issuedAt,
              createdAt: options.issuedAt,
              updatedAt: options.issuedAt,
              points: {
                createMany: {
                  data: recentPoints.map((recentPoint) => {
                    pointBalance -= recentPoint.point
                    return {
                      memberId: cart.memberId,
                      tierId: cart.member.tierId,
                      invoiceAmount: finalPrice,
                      type: ENUM_POINT_TYPE.PURCHASE,
                      pointBalance,
                      point: recentPoint.point * -1,
                      expiryDate: recentPoint.date,
                      createdAt: options.issuedAt,
                      updatedAt: options.issuedAt,
                    }
                  }),
                },
              },
            },
          },
          items: {
            createMany: {
              data: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.product.salePrice,
                unitPoint: item.product.salePoint,
                finalPrice: item.quantity * item.product.salePrice,
                finalPoint: item.quantity * item.product.salePoint,
                createdAt: options.issuedAt,
                updatedAt: options.issuedAt,
              })),
              skipDuplicates: true,
            },
          },
          redeems: {
            createMany: {
              data: cart.items.flatMap((item) =>
                Array.from({ length: item.quantity }, () => ({
                  memberId: cart.memberId,
                  productId: item.productId,
                  redeemPrice: item.product.salePrice,
                  redeemPoint: item.product.salePoint,
                  source: ENUM_REDEMPTION_SOURCE.ORDER,
                  status: ENUM_REDEMPTION_STATUS.PENDING,
                  issuedAt: options.issuedAt,
                  createdAt: options.issuedAt,
                  updatedAt: options.issuedAt,
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
          createdAt: options.issuedAt,
          updatedAt: options.issuedAt,
          items: {
            deleteMany: {},
          },
          member: {
            update: {
              pointBalance: { decrement: finalPoint },
              updatedAt: options.issuedAt,
            },
          },
        },
      }),
      ...cart.items.map((item) =>
        this.prisma.product.update({
          where: { id: item.productId },
          data: { unpaidQty: { increment: item.quantity } },
        }),
      ),
    ])
    return order
    //   return await this.create({
    //     memberId: cart.memberId,
    //     finalPrice,
    //     finalPoint,
    //     code: orderNumber,
    //     source: options.source,
    //     status: ENUM_ORDER_STATUS.PENDING,
    //     issuedAt: issuedAt,
    //     createdAt: issuedAt,
    //     updatedAt: issuedAt,
    //     invoice: {
    //       create: {
    //         code: invoiceNumber,
    //         memberId: cart.memberId,
    //         paidPrice: 0,
    //         paidPoint: finalPoint,
    //         finalPrice: finalPrice,
    //         finalPoint: finalPoint,
    //         status: ENUM_INVOICE_STATUS.PENDING,
    //         issuedAt: issuedAt,
    //         createdAt: issuedAt,
    //         updatedAt: issuedAt,
    //         points: {
    //           create: finalPoint
    //             ? {
    //                 memberId: cart.memberId,
    //                 tierId: cart.member.tierId,
    //                 invoiceAmount: finalPrice,
    //                 type: ENUM_POINT_TYPE.PURCHASE,
    //                 point: finalPoint * -1,
    //                 pointBalance: pointBalance - finalPoint,
    //                 expiryDate: this.memberService.getPointExpirationDate(issuedAt),
    //                 createdAt: issuedAt,
    //                 updatedAt: issuedAt,
    //               }
    //             : undefined,
    //         },
    //       },
    //     },
    //     items: {
    //       createMany: {
    //         data: cart.items.map((item) => ({
    //           productId: item.productId,
    //           quantity: item.quantity,
    //           unitPrice: item.product.salePrice,
    //           unitPoint: item.product.salePoint,
    //           finalPrice: item.quantity * item.product.salePrice,
    //           finalPoint: item.quantity * item.product.salePoint,
    //           createdAt: issuedAt,
    //           updatedAt: issuedAt,
    //         })),
    //         skipDuplicates: true,
    //       },
    //     },
    //   })
  }

  async onCreated(_order: TOrder): Promise<void> {}
}
