import { TInvoice } from '../interfaces'
import { InvoiceData } from './invoice.data'

export class InvoiceHelper {
  static getData(invoices: TInvoice[]): InvoiceData {
    return new InvoiceData(invoices)
  }
}
