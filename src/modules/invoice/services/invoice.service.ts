import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  ENUM_INVOICE_STATUS,
  ENUM_ORDER_SOURCE,
  ENUM_ORDER_STATUS,
  ENUM_PAYMENT_STATUS,
  ENUM_REDEMPTION_STATUS,
  Prisma,
} from '@prisma/client'
import { DateService, ENUM_DATE_FORMAT } from 'lib/nest-core'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { IInvoiceAddPaymentOptions, IInvoiceGroup, TInvoice } from '../interfaces'

@Injectable()
export class InvoiceService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly dateService: DateService,
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
      .catch((err: unknown) => {
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
      .catch((err: unknown) => {
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
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.invoice.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.InvoiceWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.invoice.paginate(where, params, options)
    })
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
    const dateNow = this.dateService.create()
    const invoice = await this.prisma.invoice.create({
      data: {
        ...data,
        issuedAt: dateNow,
        createdAt: dateNow,
        updatedAt: dateNow,
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

  async delete(invoice: TInvoice, deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.invoice.delete({ where: { id: invoice.id } })
      })
      return true
    } catch {
      return false
    }
  }

  async addPayment(invoice: TInvoice, options: IInvoiceAddPaymentOptions): Promise<TInvoice> {
    const isFullPaid = invoice.finalPrice - invoice.paidPrice <= options.amount
    const issuedAt = options?.issuedAt || this.dateService.create()

    return await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paidPrice: { increment: options.amount },
        status: isFullPaid ? ENUM_INVOICE_STATUS.FULLY_PAID : ENUM_INVOICE_STATUS.PARTIALLY_PAID,
        issuedAt: isFullPaid ? issuedAt : undefined,
        updatedAt: issuedAt,
        order: {
          update: isFullPaid
            ? {
                status: ENUM_ORDER_STATUS.DELIVERED,
                redeems: {
                  updateMany: {
                    data: {
                      isActive: true,
                      status: ENUM_REDEMPTION_STATUS.APPROVED,
                      issuedAt: issuedAt,
                      updatedAt: issuedAt,
                    },
                    where: { status: ENUM_REDEMPTION_STATUS.PENDING },
                  },
                },
              }
            : undefined,
        },
        payments: {
          create: {
            status: ENUM_PAYMENT_STATUS.PAID,
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

  async getHighestInvoice(memberId: number, startDate: Date, untilDate: Date): Promise<TInvoice> {
    return await this.prisma.invoice.findFirst({
      where: { memberId, issuedAt: { gte: startDate, lte: untilDate } },
      orderBy: [{ finalPrice: 'desc' }, { issuedAt: 'asc' }],
    })
  }

  async getFirstInvoice(issuedAt: Date): Promise<TInvoice> {
    const startOfDay = this.dateService.create(issuedAt, { startOfDay: true })
    return await this.prisma.invoice.findFirst({
      where: {
        isEarned: false,
        issuedAt: { lte: startOfDay },
        createdAt: { lte: startOfDay },
      },
      orderBy: [{ issuedAt: 'asc' }],
    })
  }

  async getEarnInvoices(issuedAt: Date): Promise<IInvoiceGroup> {
    const firstTransactionDays = this.config.get<number>('app.membership.firstTransaction', 1)
    const startOfDay = this.dateService.create(issuedAt, { startOfDay: true })
    const cutOffDay = this.dateService.backward(startOfDay, { days: firstTransactionDays })

    const invoices = await this.prisma.invoice.findMany({
      orderBy: [{ issuedAt: 'asc' }, { createdAt: 'asc' }],
      where: {
        isEarned: false,
        status: ENUM_INVOICE_STATUS.FULLY_PAID,
        issuedAt: { lte: startOfDay },
        createdAt: { lte: startOfDay },
        member: {
          isActive: true,
          OR: [
            { hasFirstPurchased: true },
            {
              invoices: {
                some: {
                  order: {
                    source: {
                      in: [ENUM_ORDER_SOURCE.SYSTEM, ENUM_ORDER_SOURCE.POS],
                    },
                  },
                  issuedAt: { lte: startOfDay },
                },
              },
            },
            {
              hasFirstPurchased: false,
              invoices: {
                some: {
                  order: {
                    source: {
                      in: [ENUM_ORDER_SOURCE.APP, ENUM_ORDER_SOURCE.WEB],
                    },
                  },
                  issuedAt: { lte: cutOffDay },
                },
              },
            },
          ],
        },
      },
    })

    const formatDate = ENUM_DATE_FORMAT.DATE_REFERENCE
    const groupInvoices: IInvoiceGroup = {}
    for (const inv of invoices) {
      const _cDate = this.dateService.format(inv.createdAt, formatDate)
      const _iDate = this.dateService.format(inv.issuedAt, formatDate)

      const _groupKey = `${_iDate}|${_cDate}`
      if (!(_groupKey in groupInvoices)) {
        groupInvoices[_groupKey] = []
      }
      groupInvoices[_groupKey].push(inv)
    }

    return groupInvoices
  }

  async expireOverDue(issuedAt: Date): Promise<void> {
    const batchSize: number = 500
    const startOfDay = this.dateService.create(issuedAt, { startOfDay: true })

    let loop: boolean = false
    do {
      const invoices = await this.prisma.invoice.findMany({
        where: {
          status: {
            in: [ENUM_INVOICE_STATUS.PENDING, ENUM_INVOICE_STATUS.PARTIALLY_PAID],
          },
          dueDate: { gte: startOfDay },
        },
        take: batchSize,
      })

      for (const invoice of invoices) {
        await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: ENUM_INVOICE_STATUS.OVERDUE,
            issuedAt: startOfDay,
            updatedAt: startOfDay,
            order: {
              update: {
                redeems: {
                  updateMany: {
                    data: {
                      status: ENUM_REDEMPTION_STATUS.REJECTED,
                      issuedAt: startOfDay,
                      updatedAt: startOfDay,
                    },
                    where: {
                      status: ENUM_REDEMPTION_STATUS.PENDING,
                    },
                  },
                },
              },
            },
          },
        })
      }

      loop = invoices.length === batchSize
    } while (loop)
  }
}
