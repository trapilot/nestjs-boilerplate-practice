import { Injectable } from '@nestjs/common'
import { EnumPushStatus, QueueCursor } from '@runtime/prisma-client'
import {
  EnumQueuePriority,
  HelperService,
  IQueueHandler,
  LoggerService,
  QueueProducer,
  QueueScanner,
} from 'lib/nest-core'
import { EnumNotificationQueue } from '../enums'
import { NotificationUtil } from '../helpers'
import { INotificationDispatchPushPayload, INotificationSendPushPayload } from '../interfaces'

@Injectable()
export class NotificationDispatchPushHandler implements IQueueHandler {
  topic = EnumNotificationQueue.PUSH_DISPATCH
  version: number = 1

  constructor(
    private readonly logger: LoggerService,
    private readonly scanner: QueueScanner,
    private readonly producer: QueueProducer,
    private readonly helperService: HelperService,
    private readonly notificationUtil: NotificationUtil,
  ) {}

  async handle(payload: INotificationDispatchPushPayload): Promise<void> {
    if (await this.notificationUtil.isPushFinished(payload.pushId)) {
      return
    }

    const push = await this.notificationUtil.getPush(payload.pushId)
    if (push.status === EnumPushStatus.PENDING) {
      await this.notificationUtil.lockPush(push.id)
    }

    const dispatchTopic = `${this.topic}:${this.version}:${push.id}`
    const state = await this.scanner.scan<QueueCursor>(dispatchTopic, this.version)

    const memberIds = await this.notificationUtil.getUnsentPushMembers(push.id, {
      lastId: state.lastId,
      size: 100,
    })

    if (!memberIds.length) {
      await this.notificationUtil.deliveredPush(push.id)
      return
    }

    for (const memberId of memberIds) {
      await this.producer.publish<INotificationSendPushPayload>(EnumNotificationQueue.SEND_PUSH, {
        version: 1,
        exclusive: false,
        autoDelete: true,
        priority: EnumQueuePriority.MEDIUM,
        startDate: this.helperService.dateNow(),
        message: {
          pushId: push.id,
          memberId,
        },
      })
    }

    await this.scanner.commit(dispatchTopic, {
      version: this.version,
      batchId: state.batchId + 1,
      lastId: memberIds[memberIds.length - 1],
    })

    // republish queue job if push is still running
    if (await this.notificationUtil.isPushRunning(push.id)) {
      this.logger.log(
        `${this.topic}:v${this.version}:p${payload.pushId}:${state.batchId} republish`,
      )
      await this.producer.republish<INotificationDispatchPushPayload>(this.topic, {
        version: this.version,
        priority: EnumQueuePriority.HIGH,
        message: payload,
      })
    }
  }
}
