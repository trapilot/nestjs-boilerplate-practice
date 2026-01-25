import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import {
  EnumInvoiceStatus,
  EnumOrderStatus,
  EnumPaymentStatus,
  EnumRedemptionStatus,
  Prisma,
} from '@runtime/prisma-client'
import { HelperService, LoggerService } from 'lib/nest-core'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { IInvoiceAddPaymentOptions, TInvoice } from '../interfaces'

@Injectable()
export class InvoiceService {
  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {}

  async findOne(kwargs?: Prisma.InvoiceFindUniqueArgs): Promise<TInvoice> {
    return await this.prisma.invoice.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.InvoiceFindFirstArgs = {}): Promise<TInvoice> {
    return await this.prisma.invoice.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.InvoiceFindManyArgs = {}): Promise<TInvoice[]> {
    return await this.prisma.invoice.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.InvoiceFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TInvoice> {
    const invoice = await this.prisma.invoice
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.invoice.notFound',
        })
      })
    return invoice
  }

  async matchOrFail(
    where: Prisma.InvoiceWhereInput,
    kwargs: Omit<Prisma.InvoiceFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TInvoice> {
    const invoice = await this.prisma.invoice
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.invoice.notFound',
        })
      })
    return invoice
  }

  async differOrFail(
    where: Prisma.InvoiceWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.invoice.conflict',
      })
    }
  }

  async list(
    where?: Prisma.InvoiceWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.invoice.list(where, params, options)
  }

  async paginate(
    where?: Prisma.InvoiceWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.invoice.paginate(where, params, options)
  }

  async count(where?: Prisma.InvoiceWhereInput): Promise<number> {
    return await this.prisma.invoice.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.InvoiceFindUniqueArgs, 'where'> = {},
  ): Promise<TInvoice> {
    return await this.prisma.invoice.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.InvoiceUncheckedCreateInput): Promise<TInvoice> {
    const nowDate = this.helperService.dateNow()
    const invoice = await this.prisma.invoice.create({
      data: {
        ...data,
        issuedAt: nowDate,
        createdAt: nowDate,
        updatedAt: nowDate,
      },
    })
    return invoice
  }

  async update(id: number, data: Prisma.InvoiceUncheckedUpdateInput): Promise<TInvoice> {
    const invoice = await this.findOrFail(id)

    return await this.prisma.invoice.update({
      data,
      where: { id: invoice.id },
    })
  }

  async delete(invoice: TInvoice, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.invoice.delete({ where: { id: invoice.id } })
      })
      return true
    } catch {
      return false
    }
  }

  async addPayment(invoice: TInvoice, options: IInvoiceAddPaymentOptions): Promise<TInvoice> {
    const isFullPaid = invoice.finalPrice - invoice.paidPrice <= options.amount
    const issuedAt = options?.issuedAt || this.helperService.dateNow()

    return await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paidPrice: { increment: options.amount },
        status: isFullPaid ? EnumInvoiceStatus.FULLY_PAID : EnumInvoiceStatus.PARTIALLY_PAID,
        issuedAt: isFullPaid ? issuedAt : undefined,
        updatedAt: issuedAt,
        order: {
          update: isFullPaid
            ? {
                status: EnumOrderStatus.DELIVERED,
                redeems: {
                  updateMany: {
                    data: {
                      isActive: true,
                      status: EnumRedemptionStatus.APPROVED,
                      issuedAt: issuedAt,
                      updatedAt: issuedAt,
                    },
                    where: { status: EnumRedemptionStatus.PENDING },
                  },
                },
              }
            : undefined,
        },
        payments: {
          create: {
            status: EnumPaymentStatus.PAID,
            method: options.method,
            amount: options.amount,
            issuedAt: issuedAt,
            createdAt: issuedAt,
            updatedAt: issuedAt,
          },
        },
      },
    })
  }

  async rejectOverDue(invoiceIds: number[]): Promise<void> {
    const nowDate = this.helperService.dateNow()

    for (const invoiceId of invoiceIds) {
      try {
        await this.prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: EnumInvoiceStatus.OVERDUE,
            issuedAt: nowDate,
            updatedAt: nowDate,
            order: {
              update: {
                redeems: {
                  updateMany: {
                    data: {
                      status: EnumRedemptionStatus.REJECTED,
                      issuedAt: nowDate,
                      updatedAt: nowDate,
                    },
                    where: {
                      status: EnumRedemptionStatus.PENDING,
                    },
                  },
                },
              },
            },
          },
        })
      } catch (err: unknown) {
        this.logger.error(err)
      }
    }
  }

  async chunkOverDue(lastId: number, chunkSize: number = 10): Promise<number[]> {
    const nowDate = this.helperService.dateNow()

    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: {
          in: [EnumInvoiceStatus.PENDING, EnumInvoiceStatus.PARTIALLY_PAID],
        },
        dueDate: { lte: nowDate },
      },
      take: chunkSize,
      orderBy: { id: 'asc' },
      select: { id: true },
      ...(lastId && {
        cursor: { id: lastId },
        skip: 1,
      }),
    })

    return invoices.map(inv => inv.id)
  }
}
