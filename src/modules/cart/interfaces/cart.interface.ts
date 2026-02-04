import { Cart, CartItem, Member, Product } from '@runtime/prisma-client'

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
  offerId?: number
  bundleId?: number
  promotionId?: number
}

export interface ICartCheckoutResult {
  cartId: number
  items: CartItem[]
  summary: ICartSnapshot
}

export interface ICartSnapshot {
  point: number
  price: number
  shipping: number
  tax: number
}
