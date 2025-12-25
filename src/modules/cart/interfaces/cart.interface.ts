import { Cart, CartItem, ENUM_ORDER_SOURCE, Member, Product } from '@prisma/client'

export interface TCartItem extends CartItem {
  product?: Product
}

export interface TCart extends Cart {
  member?: Member
  items?: TCartItem[]
}

export interface ICartRule {
  validate(cartItem: TCartItem): Promise<void>
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
  source: ENUM_ORDER_SOURCE
  shipment: {
    address: string
    phone: string
    note?: string
  }
}
