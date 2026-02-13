import { Injectable } from '@nestjs/common'
import { EnumPushStatus } from '@runtime/prisma-client'
import {
  EnumQueuePriority,
  HelperService,
  IQueueHandler,
  LoggerService,
  QueueProducer,
  QueueScanner,
} from 'lib/nest-core'
import { EnumNotificationQueue } from '../enums/notification.enum'
import { NotificationUtil } from '../helpers/notification.util'
import {
  INotificationDispatchPushPayload,
  INotificationSendPushPayload,
} from '../interfaces/notification.queue.interface'

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
    this.logger.log(`${this.topic}:v${this.version} is handling...`)

    if (await this.notificationUtil.isPushFinished(payload.pushId)) {
      return
    }

    const push = await this.notificationUtil.getPush(payload.pushId)
    if (push.status === EnumPushStatus.PENDING) {
      await this.notificationUtil.lockPush(push.id)
    }

    await this.scanner.runWithCursor({
      topic: this.topic,
      version: this.version,
      context: {
        message: payload,
        childKey: push.id,
      },

      retrieve: async state => {
        return await this.notificationUtil.getUnsentPushMembers(push.id, {
          lastId: state.lastId,
          size: 100,
        })
      },

      process: async memberIds => {
        for (const memberId of memberIds) {
          await this.producer.publish<INotificationSendPushPayload>(
            EnumNotificationQueue.SEND_PUSH,
            {
              version: 1,
              priority: EnumQueuePriority.MEDIUM,
              startDate: this.helperService.dateNow(),
              message: {
                pushId: push.id,
                memberId,
              },
            },
          )
        }
      },

      getLastId: memberIds => memberIds[memberIds.length - 1],

      shouldRepublish: async () => {
        return await this.notificationUtil.isPushRunning(push.id)
      },
    })
  }
}
