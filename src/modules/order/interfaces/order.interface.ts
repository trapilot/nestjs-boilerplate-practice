import { ENUM_ORDER_SOURCE, Order } from '@prisma/client'

export interface TOrder extends Order {}

export interface IOrderPlaceOptions {
  source: ENUM_ORDER_SOURCE
  issuedAt: Date
  shipment: {
    address: string
    phone: string
    note: string
  }
}
