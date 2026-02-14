import { Injectable, Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { IDomainEvent, IEventBus } from '../interfaces/bus.interface'
import { RunnerService } from '../services/runner.service'

@Injectable()
export class EventBus implements IEventBus {
  private readonly logger = new Logger(EventBus.name)

  /**
   * Max queued (waiting + pending) jobs per topic.
   * Prevents memory blow-up.
   */
  private readonly maxQueueSize: number = 1000

  constructor(
    private readonly emitter: EventEmitter2,
    private readonly runner: RunnerService,
  ) {}

  async publish<T>(event: IDomainEvent<T>): Promise<void> {
    const queueName = this.buildQueueName(event)

    // ---------- Backpressure ----------
    const stats = this.runner.stats(queueName)
    if (stats && stats.size + stats.pending >= this.maxQueueSize) {
      this.logger.error(
        `Backpressure: Queue ${queueName} is full (${stats.size + stats.pending}). Dropping event.`,
      )
      return
    }

    await this.runner.run(queueName, () => this.dispatchEvent(event), {
      concurrency: 5,
      retry: {
        retries: 3,
        minDelayMs: 200,
      },
    })

    this.logger.log(`Registed event: ${event.topic}`)
  }

  subscribe<T>(topic: string, handler: (event: IDomainEvent<T>) => Promise<void> | void): void {
    this.emitter.on(`${topic}:*`, async (event: IDomainEvent<T>) => {
      try {
        await Promise.resolve(handler(event))
      } catch (err: unknown) {
        this.logger.error(
          `Subscriber error on topic ${topic}`,
          err instanceof Error ? err.stack : String(err),
        )
        throw err
      }
    })
    this.logger.log(`Subscribed event: ${topic}`)
  }

  // =====================================================
  // Internal Execution
  // =====================================================

  private async dispatchEvent<T>(event: IDomainEvent<T>): Promise<void> {
    const eventName = this.buildEventName(event)

    const hasListeners = this.emitter.listenerCount(eventName) > 0
    if (!hasListeners) {
      this.logger.warn(`No listeners for event ${eventName}`)
      return
    }

    try {
      await this.emitter.emitAsync(eventName, event)
    } catch (err) {
      this.logger.error(
        `Event dispatch failed for ${eventName}`,
        err instanceof Error ? err.stack : String(err),
      )

      throw err
    }
  }

  // =====================================================
  // Dead Letter Handling
  // =====================================================

  // =====================================================
  // Helpers
  // =====================================================
  private buildEventName(event: IDomainEvent): string {
    return `${event.topic}:v${event.version}`
  }

  private buildQueueName(event: IDomainEvent): string {
    return `queue:event-bus:${event.topic}`
  }
}
