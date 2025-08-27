import { HttpException, Injectable } from '@nestjs/common'
import { Cron, CronOptions } from '@nestjs/schedule'
import { LoggerService } from 'lib/nest-logger'
import { APP_TIMEZONE, HelperDateService, NestHelper } from 'lib/nest-core'
import { PushService } from '../services'

const cronTime = process.env.CRONTAB_PUSH_SEND_NOTIFICATION
const cronName = 'task_push_send_notification'
const cronOptions: CronOptions = {
  name: cronName,
  timeZone: APP_TIMEZONE,
  disabled: !cronTime && NestHelper.isDevelopment(),
}

@Injectable()
export class PushSendNotificationTask {
  constructor(
    private readonly logger: LoggerService,
    private readonly pushService: PushService,
    private readonly helperDateService: HelperDateService,
  ) {
    this.logger.setContext(cronName)
  }

  @Cron(cronTime || '0 */3 * * * *', cronOptions)
  async execute() {
    // Process task
    const waiting = await this.waitForNextPush()
    if (!waiting) {
      this.logger.info(`${PushSendNotificationTask.name} START`, cronName)

      const pending = await this.pushService.getPending()
      if (pending) {
        try {
          this.logger.info(`Processing: #${pending.id}`, cronName)
          await this.pushService.process(pending, this.logger)
        } catch (err: unknown) {
          await this.pushService.skip(pending, this.logger)

          if (err instanceof HttpException) {
            this.logger.info(`${err.message}`, this.logger)
          }
        }
      }
      this.logger.info(`${PushSendNotificationTask.name} END`, cronName)
    }
  }

  async waitForNextPush(): Promise<boolean> {
    const pushing = await this.pushService.getPushing()
    if (!pushing) return false

    if (this.helperDateService.after(pushing.expiresAt)) {
      this.logger.info(`Expire: #${pushing.id}`, cronName)
      await this.pushService.skip(pushing, this.logger)
      return false
    }
    return true
  }
}
