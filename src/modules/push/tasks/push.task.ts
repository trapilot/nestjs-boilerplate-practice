import { HttpException, Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import {
  APP_TIMEZONE,
  AppUtil,
  EnumScopeType,
  HelperService,
  LoggerService,
  OnScope,
} from 'lib/nest-core'
import { PushService } from '../services'

@Injectable()
export class PushTask {
  constructor(
    private readonly logger: LoggerService,
    private readonly pushService: PushService,
    private readonly helperService: HelperService
  ) {}

  @Cron('0 */3 * * * *', {
    timeZone: APP_TIMEZONE,
    disabled: AppUtil.isLocal(),
  })
  @OnScope(EnumScopeType.CRON, {
    context: 'cron.push_send_notification',
    async: true,
  })
  async execute(): Promise<void> {
    const waiting = await this.waitForNextPush()
    if (!waiting) {
      const pending = await this.pushService.getPending()
      if (pending) {
        try {
          this.logger.log(`Processing: #${pending.id}`)
          await this.pushService.process(pending)
        } catch (err: unknown) {
          await this.pushService.skip(pending)

          if (err instanceof HttpException) {
            this.logger.log(`${err.message}`)
          }
        }
      }
    }
  }

  async waitForNextPush(): Promise<boolean> {
    const pushing = await this.pushService.getPushing()
    if (!pushing) {
      return false
    }

    if (this.helperService.dateCheckAfter(pushing.expiresAt)) {
      this.logger.log(`Expire: #${pushing.id}`)
      await this.pushService.skip(pushing)
      return false
    }
    return true
  }
}
