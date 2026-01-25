import { Injectable } from '@nestjs/common'
import { CircuitBreaker } from '../decorators'
import { EnumPushDriver } from '../enums'
import { PushFactory } from '../helpers'
import { IPushSendPayload } from '../interfaces'

@Injectable()
export class PushDispatcher {
  constructor(private readonly pushFactory: PushFactory) {}

  @CircuitBreaker({
    circuitGroup: 'push',
    resolveKey: (args: string[]) => args[0],
  })
  async dispatchAsync(driverName: EnumPushDriver, payload: IPushSendPayload): Promise<void> {
    const driver = this.pushFactory.getDriver(driverName)
    await driver.send(payload)
  }

  async dispatch(driverName: EnumPushDriver, payload: IPushSendPayload): Promise<boolean> {
    const driver = this.pushFactory.getDriver(driverName)
    await driver.send(payload)

    return true
  }
}
