import { TInvoice } from '../interfaces'
import { InvoiceData } from './invoice.data'

export class InvoiceUtil {
  static getData(invoices: TInvoice[]): InvoiceData {
    return new InvoiceData(invoices)
  }
}
