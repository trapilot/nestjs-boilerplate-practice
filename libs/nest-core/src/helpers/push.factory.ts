import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PushFcmDriver, PushOneSignalDriver } from '../drivers'
import { EnumPushDriver } from '../enums'
import { PushDriver } from '../interfaces'

@Injectable()
export class PushFactory {
  private readonly drivers = new Map<EnumPushDriver, PushDriver>()

  constructor(private readonly config: ConfigService) {}

  getDriver(name: EnumPushDriver): PushDriver {
    if (this.drivers.has(name)) {
      return this.drivers.get(name)!
    }

    const driver = this.createDriver(name)
    this.drivers.set(name, driver)

    return driver
  }

  private createDriver(name: EnumPushDriver): PushDriver {
    switch (name) {
      case EnumPushDriver.FCM:
        return new PushFcmDriver(this.config)

      case EnumPushDriver.ONESIGNAL:
        return new PushOneSignalDriver(this.config)

      default:
        throw new Error(`Unsupported Push driver: ${name}`)
    }
  }
}
