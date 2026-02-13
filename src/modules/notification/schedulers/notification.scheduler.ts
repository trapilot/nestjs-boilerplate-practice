import { Injectable } from '@nestjs/common'
import { CronExpression } from '@nestjs/schedule'
import { EnumAppTimezone, IScheduler, ISchedulerBus, StrUtil } from 'lib/nest-core'
import { NotificationService } from '../services/notification.service'

@Injectable()
export class NotificationScheduler implements IScheduler {
  constructor(private readonly notificationService: NotificationService) {}

  register(bus: ISchedulerBus): void {
    bus.cron(CronExpression.EVERY_5_SECONDS, this.execute.bind(this), {
      timeZone: EnumAppTimezone.UTC,
      disabled: StrUtil.isTrue(process.env.PUSH_DISABLE),
    })
  }

  private async execute(): Promise<void> {
    await this.notificationService.dispatchPendingPushes()
  }

  // private async execute(): Promise<void> {
  //   const pushes = await this.notificationUtil.getPendingPushes(2)

  //   for (const push of pushes) {
  //     try {
  //       await this.notificationUtil.validatePushCanRun(push.id)

  //       // add to queue
  //       await this.producer.publish<INotificationDispatchPushPayload>(
  //         EnumNotificationQueue.PUSH_DISPATCH,
  //         {
  //           version: 1,
  //           priority: EnumQueuePriority.LOW,
  //           startDate: this.helperService.dateNow(),
  //           message: {
  //             pushId: push.id,
  //           },
  //         },
  //       )

  //       // lock after published
  //       await this.notificationUtil.lockPush(push.id)
  //     } catch (err: unknown) {
  //       if (push.retryCount < push.maxRetries) {
  //         await this.notificationUtil.retryPush(push.id)
  //       } else {
  //         await this.notificationUtil.cancelPush(push.id)
  //       }
  //       this.logger.log(err)
  //     }
  //   }
  // }
}
