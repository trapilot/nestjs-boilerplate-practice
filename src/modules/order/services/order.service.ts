import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import {
  EnumCartStatus,
  EnumInvoiceStatus,
  EnumOrderStatus,
  EnumPointAction,
  EnumPointOrigin,
  EnumPointReason,
  EnumRedemptionSource,
  EnumRedemptionStatus,
  EnumSlipType,
  Prisma,
} from '@runtime/prisma-client'
import { EnumDateFormat, HelperService } from 'lib/nest-core'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
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

  async getOne(kwargs: Prisma.OrderFindUniqueArgs): Promise<TOrder> {
    return await this.prisma.order.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.OrderFindFirstArgs): Promise<TOrder> {
    return await this.prisma.order.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.OrderFindManyArgs): Promise<TOrder[]> {
    return await this.prisma.order.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.OrderFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.order.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.OrderFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.order.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.OrderFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TOrder> {
    return await this.prisma.order
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.order.notFound',
        })
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

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.order.delete({ where: { id } })
      })
      return true
    } catch {
      return false
    }
  }

  async createFromCart(cartId: number, options: IOrderPlaceOptions): Promise<TOrder> {
    const issuedAt = options?.issuedAt ?? this.helperService.dateNow()
    const endOfDay = this.helperService.dateCreate(issuedAt, { endOfDay: true })

    // 1. Validate & Lock the Cart
    const { cart, summary } = await this.cartService.getValidatedCart(cartId)

    const orderNumber = await this.generateOrderNumber(issuedAt)
    const invoiceNumber = await this.invoiceService.generateInvoiceNumber(issuedAt)

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
          finalPrice: summary.price,
          finalPoint: summary.point,
          code: orderNumber,
          source: options.source,
          status: EnumOrderStatus.PENDING,
          issuedAt: issuedAt,
          createdAt: issuedAt,
          updatedAt: issuedAt,
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
              paidPoint: summary.point,
              finalPrice: summary.price,
              finalPoint: summary.point,
              status: EnumInvoiceStatus.PARTIALLY_PAID,
              dueDate: dueDate,
              issuedAt: issuedAt,
              createdAt: issuedAt,
              updatedAt: issuedAt,
              points: {
                create: {
                  memberId: cart.memberId,
                  tierId: cart.member.tierId,
                  origin: EnumPointOrigin.MEMBER,
                  reason: EnumPointReason.PURCHASE,
                  action: EnumPointAction.DEDUCT,
                  point: summary.point * -1,
                  createdAt: issuedAt,
                  updatedAt: issuedAt,
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
                createdAt: issuedAt,
                updatedAt: issuedAt,
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
                  issuedAt: issuedAt,
                  createdAt: issuedAt,
                  updatedAt: issuedAt,
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
          status: EnumCartStatus.COMPLETED,
          createdAt: issuedAt,
          updatedAt: issuedAt,
          member: {
            update: {
              pointBalance: { decrement: summary.point },
              updatedAt: issuedAt,
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
