import { Injectable } from '@nestjs/common'
import { CircuitBreaker, Concurrency } from '../decorators'
import { EnumSmsDriver } from '../enums'
import { SmsRegistry } from '../helpers'
import { ISmsSendPayload } from '../interfaces'
import { RunnerService } from '../services'

@Injectable()
export class SmsDispatcher {
  constructor(
    private readonly registry: SmsRegistry,
    private readonly _runner: RunnerService, // For @Concurrency
  ) {}

  /**
   * Public API
   * - Queue + retry + rate limit
   * - Good for burst traffic
   */
  @Concurrency({
    queue: 'dispatcher:sms:send',
    concurrency: 20, // max parallel sends
    retry: { retries: 2 }, // auto retry
    circuit: {
      // fallback protection
      failureThreshold: 5,
      cooldownMs: 10000,
    },
  })
  async dispatchAsync(driverName: EnumSmsDriver, payload: ISmsSendPayload): Promise<void> {
    return this.sendWithCircuit(driverName, payload)
  }

  /**
   * Sync version (no queue, no retry)
   * For internal immediate usage
   */
  async dispatch(driverName: EnumSmsDriver, payload: ISmsSendPayload): Promise<boolean> {
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
    circuitGroup: 'sms',
    resolveKey: (args: [EnumSmsDriver]) => args[0],
  })
  private async sendWithCircuit(
    driverName: EnumSmsDriver,
    payload: ISmsSendPayload,
  ): Promise<void> {
    const driver = this.registry.resolve(driverName)
    await driver.send(payload)
  }
}
