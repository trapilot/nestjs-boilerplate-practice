import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { IDomainEvent, IEventBus } from '../interfaces/bus.interface'

@Injectable()
export class EventBusService implements IEventBus {
  constructor(private readonly emitter: EventEmitter2) {}

  publish<T>(event: IDomainEvent<T>): void {
    this.emitter.emit(`${event.topic}:v${event.version}`, event.payload)
  }
}
