import { TOrder } from '../interfaces'

export class OrderCreatedEvent {
  order: TOrder

  static eventPath = 'order.event.created'
  constructor(order: TOrder) {
    this.order = order
  }
}
