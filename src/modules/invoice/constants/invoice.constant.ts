import { EnumInvoiceQueue } from '../enums/invoice.enum'

export const INVOICE_UPLOAD_IMAGE_PATH = `public/uploads/images/invoices`

export const INVOICE_QUEUE_SCAN_VERSION = {
  [EnumInvoiceQueue.SCAN_EARN_POINTS]: 1,
  [EnumInvoiceQueue.SCAN_OVER_DUE_INVOICES]: 1,
} as const

export const INVOICE_QUEUE_PROC_VERSION = {
  [EnumInvoiceQueue.PROC_EARN_POINTS]: 1,
  [EnumInvoiceQueue.PROC_OVER_DUE_INVOICES]: 1,
} as const
