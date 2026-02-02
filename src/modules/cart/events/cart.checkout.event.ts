import { TCart } from '../interfaces/cart.interface'

export class CartCheckoutEvent {
  static eventPath = 'cart.event.checkout'

  readonly cart: TCart

  constructor(cart: TCart) {
    this.cart = cart
  }
}
