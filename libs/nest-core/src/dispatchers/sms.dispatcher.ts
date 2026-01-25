import { Injectable } from '@nestjs/common'
import { CircuitBreaker } from '../decorators'
import { EnumSmsDriver } from '../enums'
import { SmsFactory } from '../helpers'
import { ISmsSendPayload } from '../interfaces'

@Injectable()
export class SmsDispatcher {
  constructor(private readonly smsFactory: SmsFactory) {}

  @CircuitBreaker({
    circuitGroup: 'sms',
    resolveKey: (args: string[]) => args[0],
  })
  async dispatchAsync(driverName: EnumSmsDriver, payload: ISmsSendPayload): Promise<void> {
    const driver = this.smsFactory.getDriver(driverName)
    await driver.send(payload)
  }

  async dispatch(driverName: EnumSmsDriver, payload: ISmsSendPayload): Promise<boolean> {
    const driver = this.smsFactory.getDriver(driverName)
    await driver.send(payload)

    return true
  }
}
