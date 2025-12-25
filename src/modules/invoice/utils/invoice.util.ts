import { InvoiceData } from '../helpers'
import { TInvoice } from '../interfaces'

export class InvoiceUtil {
  static getData(invoices: TInvoice[]): InvoiceData {
    return new InvoiceData(invoices)
  }
}
