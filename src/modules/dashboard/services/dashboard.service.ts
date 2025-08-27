import { Injectable, OnModuleInit } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { HelperDateService } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { TDashboard } from '../interfaces'

@Injectable()
export class DashboardService implements OnModuleInit {
  constructor(
    private readonly ref: ModuleRef,
    private readonly prisma: PrismaService,
    private readonly helperDateService: HelperDateService,
  ) {}

  onModuleInit() {}

  async getSummary(date: Date): Promise<TDashboard> {
    const startOfDay = this.helperDateService.create(date, { startOfDay: true })
    const endOfDay = this.helperDateService.create(date, { endOfDay: true })

    const [
      totalMasters,
      totalTodayTasks,
      totalTodayProfit,
      totalUnpaidOrders,
      totalPartialOrders,
      totalPaidOrders,
      totalCancelOrders,
    ] = await Promise.all([
      this.prisma.member.count({ where: { isActive: true } }),
      0,
      0,
      0,
      0,
      0,
      0,
    ])

    return {
      totalMasters,
      totalTodayTasks,
      totalTodayProfit,
      totalUnpaidOrders,
      totalPartialOrders,
      totalPaidOrders,
      totalCancelOrders,
    }
  }
}
