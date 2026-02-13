import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SmsTwilioDriver } from '../drivers'
import { EnumSmsDriver } from '../enums'
import { SmsDriver } from '../interfaces'

@Injectable()
export class SmsRegistry {
  private readonly drivers = new Map<EnumSmsDriver, SmsDriver>()

  constructor(private readonly config: ConfigService) {}

  resolve(driver: EnumSmsDriver): SmsDriver {
    if (this.drivers.has(driver)) {
      return this.drivers.get(driver)!
    }

    const instance = this.create(driver)
    this.drivers.set(driver, instance)

    return instance
  }

  private create(driver: EnumSmsDriver): SmsDriver {
    switch (driver) {
      case EnumSmsDriver.TWILIO:
        return new SmsTwilioDriver(this.config)

      // case 'nexmo':
      //   return new SmsNexmoDriver(this.config)

      default:
        throw new Error(`Unsupported SMS driver: ${driver}`)
    }
  }
}
