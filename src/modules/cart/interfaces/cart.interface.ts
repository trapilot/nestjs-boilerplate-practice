import { Cart, CartItem, EnumOrderSource, Member, Product } from '@runtime/prisma-client'

export type TCartItem = CartItem & {
  product?: Product
}

export type TCart = Cart & {
  member?: Member
  items?: TCartItem[]
}

export interface ICartItemAddOptions {
  productId: number
  quantity: number
  offerId: number
  bundleId: number
  promotionId: number
}

export interface ICartCheckoutOptions {
  dateDebug?: Date
  source: EnumOrderSource
  shipment: {
    address: string
    phone: string
    note?: string
  }
}
