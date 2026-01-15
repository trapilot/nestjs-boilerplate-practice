import { Injectable } from '@nestjs/common'
import { EnumInvoiceStatus } from '@runtime/prisma-client'
import { HelperService } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { TDashboard } from '../interfaces'

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService
  ) {}

  async getSummary(startDate: Date, untilDate: Date): Promise<TDashboard> {
    const startTime = this.helperService.dateCreate(startDate, { startOfDay: true })
    const untilTime = this.helperService.dateCreate(untilDate, { endOfDay: true })

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
          status: EnumInvoiceStatus.PENDING,
        },
      }),
      this.prisma.invoice.count({
        where: {
          createdAt: { gte: startTime, lte: untilTime },
          status: EnumInvoiceStatus.PARTIALLY_PAID,
        },
      }),
      ,
      this.prisma.invoice.count({
        where: {
          createdAt: { gte: startTime, lte: untilTime },
          status: EnumInvoiceStatus.FULLY_PAID,
        },
      }),
      this.prisma.invoice.count({
        where: {
          createdAt: { gte: startTime, lte: untilTime },
          status: EnumInvoiceStatus.CANCELED,
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

  async viewDataList<T>(_startDate: Date, _untilDate: Date): Promise<T[]> {
    return []
  }
}
