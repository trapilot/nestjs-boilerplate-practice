import { Expose, Type } from 'class-transformer'
import { ToDecimal } from 'lib/nest-core'

export class DashboardSummaryResponseDto {
  @Type(() => Number)
  @Expose()
  totalMasters: number

  @Type(() => Number)
  @Expose()
  totalTodayTasks: number

  @ToDecimal()
  @Expose()
  totalTodayProfit: string

  @Type(() => Number)
  @Expose()
  totalUnpaidOrders: number

  @Type(() => Number)
  @Expose()
  totalPartialOrders: number

  @Type(() => Number)
  @Expose()
  totalPaidOrders: number

  @Type(() => Number)
  @Expose()
  totalCancelOrders: number
}
