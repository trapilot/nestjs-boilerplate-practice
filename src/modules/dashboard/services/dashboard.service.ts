import { Injectable, OnModuleInit } from '@nestjs/common'
import { ENUM_INVOICE_STATUS } from '@prisma/client'
import { DateService } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { TDashboard } from '../interfaces'

@Injectable()
export class DashboardService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dateService: DateService,
  ) {}

  onModuleInit() {}

  async getSummary(startDate: Date, untilDate: Date): Promise<TDashboard> {
    const startTime = this.dateService.create(startDate, { startOfDay: true })
    const untilTime = this.dateService.create(untilDate, { endOfDay: true })

    const [
      totalMembers,
      totalUnpaidInvoices,
      totalPartialInvoices,
      totalPaidInvoices,
      totalCancelInvoices,
    ] = await Promise.all([
      this.prisma.member.count({ where: { createdAt: { gte: startTime, lte: untilTime } } }),
      this.prisma.invoice.count({
        where: {
          createdAt: { gte: startTime, lte: untilTime },
          status: ENUM_INVOICE_STATUS.PENDING,
        },
      }),
      this.prisma.invoice.count({
        where: {
          createdAt: { gte: startTime, lte: untilTime },
          status: ENUM_INVOICE_STATUS.PARTIALLY_PAID,
        },
      }),
      ,
      this.prisma.invoice.count({
        where: {
          createdAt: { gte: startTime, lte: untilTime },
          status: ENUM_INVOICE_STATUS.FULLY_PAID,
        },
      }),
      this.prisma.invoice.count({
        where: {
          createdAt: { gte: startTime, lte: untilTime },
          status: ENUM_INVOICE_STATUS.CANCELED,
        },
      }),
    ])

    return {
      totalMembers,
      totalUnpaidInvoices,
      totalPartialInvoices,
      totalPaidInvoices,
      totalCancelInvoices,
    }
  }

  async viewDataList(_startDate: Date, _untilDate: Date) {
    return []
  }
}
