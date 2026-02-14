import { Injectable } from '@nestjs/common'
import {
  EnumQueuePriority,
  HelperService,
  IQueueHandler,
  LoggerService,
  QueueProducer,
  QueueScanner,
} from 'lib/nest-core'
import { EnumNotificationQueue } from '../enums/notification.enum'
import {
  INotificationDispatchPushPayload,
  INotificationSendPushPayload,
} from '../interfaces/notification.queue.interface'
import { NotificationService } from '../services/notification.service'

@Injectable()
export class NotificationDispatchPushHandler implements IQueueHandler {
  topic = EnumNotificationQueue.PUSH_DISPATCH
  version: number = 1

  constructor(
    private readonly logger: LoggerService,
    private readonly scanner: QueueScanner,
    private readonly producer: QueueProducer,
    private readonly helperService: HelperService,
    private readonly notificationService: NotificationService,
  ) {}

  async handle(payload: INotificationDispatchPushPayload): Promise<void> {
    this.logger.log(`${this.topic}:v${this.version} is handling...`)

    if (await this.notificationService.isPushFinished(payload.pushId)) {
      return
    }

    await this.scanner.runWithCursor({
      topic: this.topic,
      version: this.version,
      context: {
        message: payload,
        childKey: payload.pushId,
      },

      retrieve: async state => {
        return await this.notificationService.getUnsentPushMembers(payload.pushId, {
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
                pushId: payload.pushId,
                memberId,
              },
            },
          )
        }
      },

      getLastId: memberIds => memberIds[memberIds.length - 1],

      shouldRepublish: async () => {
        return await this.notificationService.isPushRunning(payload.pushId)
      },
    })
  }
}
