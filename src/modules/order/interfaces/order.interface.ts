import { EnumOrderSource, Order } from '@runtime/prisma-client'

export type TOrder = Order

export interface IOrderPlaceOptions {
  source: EnumOrderSource
  issuedAt: Date
  shipment: {
    address: string
    phone: string
    note: string
  }
}
