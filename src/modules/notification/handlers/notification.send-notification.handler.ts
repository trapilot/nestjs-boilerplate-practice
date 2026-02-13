import { Injectable } from '@nestjs/common'
import { IQueueHandler, LoggerService } from 'lib/nest-core'
import { EnumNotificationQueue } from '../enums/notification.enum'
import { NotificationUtil } from '../helpers/notification.util'
import { INotificationSendPushPayload } from '../interfaces/notification.queue.interface'

@Injectable()
export class NotificationSendPushHandler implements IQueueHandler {
  topic = EnumNotificationQueue.SEND_PUSH
  version: number = 1

  constructor(
    private readonly logger: LoggerService,
    private readonly notificationUtil: NotificationUtil,
  ) {}

  async handle(payload: INotificationSendPushPayload): Promise<void> {
    try {
      await this.notificationUtil.dispatchPushToMember(payload.memberId, payload.pushId)
    } catch (err: unknown) {
      this.logger.log(err)
      throw err
    }
  }
}
