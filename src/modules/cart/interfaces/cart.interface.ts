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
  offerId: number
  bundleId: number
  promotionId: number
}
