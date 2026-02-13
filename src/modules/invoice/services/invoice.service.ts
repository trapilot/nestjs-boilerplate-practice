import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import {
  EnumInvoiceStatus,
  EnumOrderStatus,
  EnumPaymentStatus,
  EnumRedemptionStatus,
  EnumSlipType,
  Prisma,
} from '@runtime/prisma-client'
import { EnumDateFormat, HelperService, LoggerService } from 'lib/nest-core'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { InvoiceUtil } from '../helpers/invoice.util'
import { IInvoiceAddPaymentOptions, TInvoice } from '../interfaces/invoice.interface'

@Injectable()
export class InvoiceService {
  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly invoiceUtil: InvoiceUtil,
  ) {}

  async getOne(kwargs: Prisma.InvoiceFindUniqueArgs): Promise<TInvoice> {
    return await this.prisma.invoice.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.InvoiceFindFirstArgs): Promise<TInvoice> {
    return await this.prisma.invoice.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.InvoiceFindManyArgs): Promise<TInvoice[]> {
    return await this.prisma.invoice.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.InvoiceFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.invoice.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.InvoiceFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.invoice.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.InvoiceFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TInvoice> {
    return await this.prisma.invoice
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.invoice.notFound',
        })
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

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.invoice.delete({ where: { id } })
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
                redemptions: {
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
            provider: options?.provider,
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
                redemptions: {
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

  async generateInvoiceNumber(issuedAt: Date): Promise<string> {
    const key = this.helperService.dateFormat(issuedAt, EnumDateFormat.DATE_REFERENCE)
    const type = EnumSlipType.INVOICE
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

  async getEarnInvoices(issuedAt: Date): Promise<TInvoice[]> {
    return await this.invoiceUtil.getEarnInvoices(issuedAt)
  }
}
