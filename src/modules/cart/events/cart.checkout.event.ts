import { TCart } from '../interfaces'

export class CartCheckoutEvent {
  static eventPath = 'cart.event.checkout'

  readonly cart: TCart

  constructor(cart: TCart) {
    this.cart = cart
  }
}
