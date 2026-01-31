import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnumInvoiceStatus, EnumOrderSource, EnumSlipType } from '@runtime/prisma-client'
import { EnumDateFormat, HelperService } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { InvoiceData } from '.'
import { IInvoiceGroup, TInvoice } from '../interfaces'

@Injectable()
export class InvoiceUtil {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {}

  getData(invoices: TInvoice[]): InvoiceData {
    return new InvoiceData(invoices)
  }

  async getInvoiceNumber(issuedAt: Date): Promise<string> {
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

  async getHighestInvoice(memberId: number, startDate: Date, untilDate: Date): Promise<TInvoice> {
    return await this.prisma.invoice.findFirst({
      where: { memberId, issuedAt: { gte: startDate, lte: untilDate } },
      orderBy: [{ finalPrice: 'desc' }, { issuedAt: 'asc' }],
    })
  }

  async getFirstInvoice(issuedAt: Date): Promise<TInvoice> {
    return await this.prisma.invoice.findFirst({
      where: {
        isEarned: false,
        issuedAt: { lte: issuedAt },
        createdAt: { lte: issuedAt },
      },
      orderBy: [{ issuedAt: 'asc' }],
    })
  }

  async getEarnInvoices(issuedAt: Date): Promise<IInvoiceGroup> {
    const firstTransactionDays = this.config.getOrThrow<number>('module.member.firstTransaction')
    const startOfDay = this.helperService.dateCreate(issuedAt, { startOfDay: true })
    const cutOffDay = this.helperService.dateBackward(startOfDay, { days: firstTransactionDays })

    const invoices = await this.prisma.invoice.findMany({
      orderBy: [{ issuedAt: 'asc' }, { createdAt: 'asc' }],
      where: {
        isEarned: false,
        status: EnumInvoiceStatus.FULLY_PAID,
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
                      in: [EnumOrderSource.SYSTEM, EnumOrderSource.POS],
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
                      in: [EnumOrderSource.APP, EnumOrderSource.WEB],
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

    const formatDate = EnumDateFormat.DATE_REFERENCE
    const groupInvoices: IInvoiceGroup = {}
    for (const inv of invoices) {
      const _cDate = this.helperService.dateFormat(inv.createdAt, formatDate)
      const _iDate = this.helperService.dateFormat(inv.issuedAt, formatDate)

      const _groupKey = `${_iDate}|${_cDate}`
      if (!(_groupKey in groupInvoices)) {
        groupInvoices[_groupKey] = []
      }
      groupInvoices[_groupKey].push(inv)
    }

    return groupInvoices
  }
}
