import { Injectable } from '@nestjs/common'
import { CircuitBreaker, Concurrency } from '../decorators'
import { EnumPushDriver } from '../enums'
import { PushRegistry } from '../helpers'
import { IPushSendPayload } from '../interfaces'
import { RunnerService } from '../services'

@Injectable()
export class PushDispatcher {
  constructor(
    private readonly registry: PushRegistry,
    private readonly _runner: RunnerService, // For @Concurrency
  ) {}

  /**
   * Public API
   * - Queue + retry + rate limit
   * - Good for burst traffic
   */
  @Concurrency({
    queue: 'dispatcher:push:send',
    concurrency: 20, // max parallel sends
    retry: { retries: 2 }, // auto retry
    circuit: {
      // fallback protection
      failureThreshold: 5,
      cooldownMs: 10000,
    },
  })
  async dispatchAsync(driverName: EnumPushDriver, payload: IPushSendPayload): Promise<void> {
    return this.sendWithCircuit(driverName, payload)
  }

  /**
   * Sync version (no queue, no retry)
   * For internal immediate usage
   */
  async dispatch(driverName: EnumPushDriver, payload: IPushSendPayload): Promise<boolean> {
    const driver = this.registry.resolve(driverName)
    await driver.send(payload)
    return true
  }

  /**
   * Internal protected method
   * - Circuit per driver
   * - Fast-fail if driver down
   */
  @CircuitBreaker({
    circuitGroup: 'push',
    resolveKey: (args: [EnumPushDriver]) => args[0],
  })
  private async sendWithCircuit(
    driverName: EnumPushDriver,
    payload: IPushSendPayload,
  ): Promise<void> {
    const driver = this.registry.resolve(driverName)
    await driver.send(payload)
  }
}
