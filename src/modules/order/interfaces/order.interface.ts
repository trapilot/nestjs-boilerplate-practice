import { EnumOrderSource, Order } from '@runtime/prisma-client'

export type TOrder = Order

export interface IOrderPlaceOptions {
  source: EnumOrderSource
  shipment: {
    address: string
    phone: string
    note?: string
  }
}
