import { Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { APP_ENV } from '../constants'
import { EnumAppTimezone } from '../enums'
import { AppUtil, StrUtil } from '../utils'

export abstract class ScheduleMockupBase {
  protected readonly logger: Logger = new Logger(ScheduleMockupBase.name)
  protected isStarting: boolean = false

  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: EnumAppTimezone.UTC,
    disabled: StrUtil.isNotTrue(process.env.AUTO_GEN_MODE, true),
  })
  async cron(): Promise<void> {
    this.logger.log(`${this.constructor.name} starting...`)

    if (AppUtil.isLive()) {
      throw new Error(`${this.constructor.name} running mock data on ${APP_ENV}`)
    }

    try {
      if (this.isStarting) {
        this.logger.log(`${this.constructor.name} previous mock data isn't finished`)
        return
      }

      this.isStarting = true
      const isMockable = await this.mockable()
      if (!isMockable) {
        this.logger.log(`${this.constructor.name} mock data reach to limitation`)
        return
      }

      await this.mockup()
    } catch (err: unknown) {
      this.logger.error(err)
      throw err
    } finally {
      this.isStarting = false
    }

    this.logger.log(`${this.constructor.name} run successfully`)
  }

  abstract mockable(): Promise<boolean>
  abstract mockup(): Promise<void>
}
