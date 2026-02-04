import { EnumOrderSource, Order } from '@runtime/prisma-client'

export type TOrder = Order

export interface IOrderPlaceOptions {
  issuedAt?: Date
  source: EnumOrderSource
  shipment: {
    address: string
    phone: string
    note?: string
  }
}
