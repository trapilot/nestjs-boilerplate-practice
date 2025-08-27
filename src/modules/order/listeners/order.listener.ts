import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { OrderCreatedEvent } from '../events'
import { OrderService } from '../services'

@Injectable()
export class OrderListener {
  constructor(private readonly orderService: OrderService) {}

  @OnEvent(OrderCreatedEvent.eventPath, { async: true })
  async onCreated(event: OrderCreatedEvent) {
    await this.orderService.onCreated(event.order)
  }
}
