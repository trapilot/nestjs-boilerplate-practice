import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  EnumAppTimezone,
  EnumQueuePriority,
  HelperService,
  LoggerService,
  QueueProducer,
  StrUtil,
} from 'lib/nest-core'
import { EnumNotificationQueue } from '../enums'
import { NotificationUtil } from '../helpers'
import { INotificationDispatchPushPayload } from '../interfaces'

@Injectable()
export class NotificationScheduler {
  constructor(
    private readonly logger: LoggerService,
    private readonly producer: QueueProducer,
    private readonly helperService: HelperService,
    private readonly notificationUtil: NotificationUtil,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS, {
    timeZone: EnumAppTimezone.UTC,
    disabled: StrUtil.isTrue(process.env.PUSH_DISABLE),
  })
  async execute(): Promise<void> {
    const pushes = await this.notificationUtil.getPendingPushes(2)

    for (const push of pushes) {
      try {
        await this.notificationUtil.validatePushCanRun(push.id)

        // add to queue
        await this.producer.publish<INotificationDispatchPushPayload>(
          EnumNotificationQueue.PUSH_DISPATCH,
          {
            version: 1,
            exclusive: false,
            autoDelete: true,
            priority: EnumQueuePriority.LOW,
            startDate: this.helperService.dateNow(),
            message: {
              pushId: push.id,
            },
          },
        )

        // lock after published
        await this.notificationUtil.lockPush(push.id)
      } catch (err: unknown) {
        await this.notificationUtil.retryPush(push.id)
        this.logger.log(err)
      }
    }
  }
}
