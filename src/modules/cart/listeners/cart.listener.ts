import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { CartCheckoutEvent } from '../events'
import { CartService } from '../services'

@Injectable()
export class CartListener {
  constructor(private readonly cartService: CartService) {}

  @OnEvent(CartCheckoutEvent.eventPath, { async: true })
  async onCreated(event: CartCheckoutEvent) {
    await this.cartService.handleCheckoutSuccess(event.cart)
  }
}
