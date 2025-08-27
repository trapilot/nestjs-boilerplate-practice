import { ENUM_PAYMENT_METHOD, Invoice } from '@prisma/client'

export interface TInvoice extends Invoice {}

export interface IInvoiceGroup {
  [key: string]: TInvoice[]
}

export interface IInvoiceAddPaymentOptions {
  amount: number
  method: ENUM_PAYMENT_METHOD
  issuedAt?: Date
}
