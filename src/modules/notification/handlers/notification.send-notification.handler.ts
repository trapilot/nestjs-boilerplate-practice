import { Injectable } from '@nestjs/common'
import { IQueueHandler, LoggerService } from 'lib/nest-core'
import { EnumNotificationQueue } from '../enums'
import { NotificationUtil } from '../helpers'
import { INotificationSendPushPayload } from '../interfaces'

@Injectable()
export class NotificationSendPushHandler implements IQueueHandler {
  topic = EnumNotificationQueue.SEND_PUSH
  version: number = 1

  constructor(
    private readonly logger: LoggerService,
    private readonly notificationUtil: NotificationUtil,
  ) {}

  async handle(payload: INotificationSendPushPayload): Promise<void> {
    if (await this.notificationUtil.isPushFinished(payload.pushId)) {
      return
    }

    try {
      await this.notificationUtil.dispatchPushToMember(payload.memberId, payload.pushId)
    } catch (err: unknown) {
      await this.notificationUtil.cancelPush(payload.pushId, err)
      this.logger.log(err)
    }
  }
}
