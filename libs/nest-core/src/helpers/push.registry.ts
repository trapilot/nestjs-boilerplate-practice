import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PushFcmDriver, PushOneSignalDriver } from '../drivers'
import { EnumPushDriver } from '../enums'
import { PushDriver } from '../interfaces'

@Injectable()
export class PushRegistry {
  private readonly drivers = new Map<EnumPushDriver, PushDriver>()

  constructor(private readonly config: ConfigService) {}

  resolve(driver: EnumPushDriver): PushDriver {
    if (this.drivers.has(driver)) {
      return this.drivers.get(driver)!
    }

    const instance = this.create(driver)

    this.drivers.set(driver, instance)

    return instance
  }

  private create(driver: EnumPushDriver): PushDriver {
    switch (driver) {
      case EnumPushDriver.FCM:
        return new PushFcmDriver(this.config)

      case EnumPushDriver.ONESIGNAL:
        return new PushOneSignalDriver(this.config)

      default:
        throw new Error(`Unsupported Push driver: ${driver}`)
    }
  }
}
