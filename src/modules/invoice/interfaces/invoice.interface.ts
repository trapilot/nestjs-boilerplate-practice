import { EnumPaymentMethod, Invoice } from '@runtime/prisma-client'

export type TInvoice = Invoice

export interface IInvoiceGroup {
  [key: string]: TInvoice[]
}

export interface IInvoiceAddPaymentOptions {
  amount: number
  method: EnumPaymentMethod
  issuedAt?: Date
}
