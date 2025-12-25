import { Expose, Type } from 'class-transformer'

export class DashboardSummaryResponseDto {
  @Type(() => Number)
  @Expose()
  totalMembers: number

  @Type(() => Number)
  @Expose()
  totalUnpaidInvoices: number

  @Type(() => Number)
  @Expose()
  totalPartialInvoices: number

  @Type(() => Number)
  @Expose()
  totalPaidInvoices: number

  @Type(() => Number)
  @Expose()
  totalCancelInvoices: number
}
