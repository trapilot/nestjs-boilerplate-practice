export interface TDashboard {
  totalMembers: number
  totalUnpaidInvoices: number
  totalPartialInvoices: number
  totalPaidInvoices: number
  totalCancelInvoices: number
}

export interface IDashboardDateRange {
  untilDate: Date
  sinceDate: Date
}
