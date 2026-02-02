import { DateUtil } from 'lib/nest-core'
import { TInvoice } from '../interfaces/invoice.interface'

export class InvoiceData {
  public ids: number[] = []
  public sinceDate: Date
  public untilDate: Date
  public totalAmount: number = 0
  public highestInvoice: TInvoice

  constructor(invoices: TInvoice[]) {
    for (const invoice of invoices) {
      this.ids.push(invoice.id)
      this.totalAmount += invoice.finalPrice

      if (this.sinceDate > invoice.issuedAt) {
        this.sinceDate = DateUtil.asDate(invoice.issuedAt, { startOfDay: true })
      }
      if (this.untilDate < invoice.issuedAt) {
        this.untilDate = DateUtil.asDate(invoice.issuedAt, { endOfDay: true })
      }

      if (this.highestInvoice?.finalPrice < invoice.finalPrice) {
        this.highestInvoice = invoice
      }
    }
  }
}
