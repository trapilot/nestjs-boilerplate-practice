import { Injectable } from '@nestjs/common'
import {
  EnumQueuePriority,
  HelperService,
  IWorkerHandler,
  LoggerService,
  WorkerProducer,
  WorkerScanner,
} from 'lib/nest-core'
import { NOTIFICATION_QUEUE_PROC_VERSION } from '../constants/notification.constant'
import { EnumNotificationQueue } from '../enums/notification.enum'
import {
  INotificationDispatchPushPayload,
  INotificationSendPushPayload,
} from '../interfaces/notification.queue.interface'
import { NotificationService } from '../services/notification.service'

@Injectable()
export class NotificationDispatchPushHandler implements IWorkerHandler {
  topic = EnumNotificationQueue.PUSH_DISPATCH
  version: number = NOTIFICATION_QUEUE_PROC_VERSION[EnumNotificationQueue.PUSH_DISPATCH]

  constructor(
    private readonly logger: LoggerService,
    private readonly scanner: WorkerScanner,
    private readonly producer: WorkerProducer,
    private readonly helperService: HelperService,
    private readonly notificationService: NotificationService,
  ) {}

  async handle(version: number, payload: INotificationDispatchPushPayload): Promise<void> {
    this.logger.log(`${this.topic}:v${version} is handling...`)

    if (await this.notificationService.isPushFinished(payload.pushId)) {
      return
    }

    const nowDate = this.helperService.dateNow()

    await this.scanner.runWithCursor({
      topic: this.topic,
      version: this.version,
      chunking: 100,
      context: {
        message: payload,
        childKey: payload.pushId,
      },

      retrieve: async state => {
        return await this.notificationService.getUnsentPushMembers(payload.pushId, {
          lastId: state.lastId,
          size: 500,
        })
      },

      process: async memberIds => {
        await this.producer.publish<INotificationSendPushPayload>(EnumNotificationQueue.SEND_PUSH, {
          version: NOTIFICATION_QUEUE_PROC_VERSION[EnumNotificationQueue.SEND_PUSH],
          priority: EnumQueuePriority.MEDIUM,
          startDate: nowDate,
          message: {
            pushId: payload.pushId,
            memberIds,
          },
        })

        return memberIds[memberIds.length - 1]
      },

      shouldRepublish: async () => {
        return await this.notificationService.isPushRunning(payload.pushId)
      },
    })
  }
}
