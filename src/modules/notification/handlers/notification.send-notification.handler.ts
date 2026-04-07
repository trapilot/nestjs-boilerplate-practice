import { Injectable } from '@nestjs/common'
import { IWorkerHandler, LoggerService } from 'lib/nest-core'
import { NOTIFICATION_QUEUE_PROC_VERSION } from '../constants/notification.constant'
import { EnumNotificationQueue } from '../enums/notification.enum'
import { INotificationSendPushPayload } from '../interfaces/notification.queue.interface'
import { NotificationService } from '../services/notification.service'

@Injectable()
export class NotificationSendPushHandler implements IWorkerHandler {
  topic = EnumNotificationQueue.SEND_PUSH
  version: number = NOTIFICATION_QUEUE_PROC_VERSION[EnumNotificationQueue.SEND_PUSH]

  constructor(
    private readonly logger: LoggerService,
    private readonly notificationService: NotificationService,
  ) {}

  async handle(version: number, payload: INotificationSendPushPayload): Promise<void> {
    this.logger.log(`${this.topic}:v${version} is handling...`)

    try {
      for (const memberId of payload.memberIds) {
        await this.notificationService.dispatchPushToMember(memberId, payload.pushId)
      }
    } catch (err: unknown) {
      this.logger.log(err)
    }
  }
}
