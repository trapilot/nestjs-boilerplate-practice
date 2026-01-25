import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SmsTwilioDriver } from '../drivers'
import { EnumSmsDriver } from '../enums'
import { SmsDriver } from '../interfaces'

@Injectable()
export class SmsFactory {
  private readonly drivers = new Map<EnumSmsDriver, SmsDriver>()

  constructor(private readonly config: ConfigService) {}

  getDriver(name: EnumSmsDriver): SmsDriver {
    if (this.drivers.has(name)) {
      return this.drivers.get(name)!
    }

    const driver = this.createDriver(name)
    this.drivers.set(name, driver)

    return driver
  }

  private createDriver(name: EnumSmsDriver): SmsDriver {
    switch (name) {
      case EnumSmsDriver.TWILIO:
        return new SmsTwilioDriver(this.config)

      // case 'nexmo':
      //   return new SmsNexmoDriver(this.config)

      default:
        throw new Error(`Unsupported SMS driver: ${name}`)
    }
  }
}
