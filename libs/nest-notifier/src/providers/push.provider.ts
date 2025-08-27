import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as admin from 'firebase-admin'
import {
  FailedAttemptError,
  FeatureDisabledException,
  NestQueue,
  pNestRetry,
  ROOT_PATH,
} from 'lib/nest-core'
import { LoggerService } from 'lib/nest-logger'
import { join } from 'path'
import { INotificationPayload } from '../interfaces'

@Injectable()
export class PushProvider {
  private readonly dryRun: boolean

  private queue = new NestQueue({ concurrency: 1 })
  private fcm: admin.messaging.Messaging

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.dryRun = this.config.get<boolean>('notification.push.dryRun')
    this.logger.setContext('push')
  }

  send(payload: INotificationPayload) {
    if (this.dryRun) {
      throw new FeatureDisabledException(
        `Simulating push on Mobile Devices when developing. SMS message: ${payload.content}`,
      )
    }

    if (!this.fcm) {
      const filePath = this.config.get<string>('notification.push.firebase.serviceAccountPath')
      const app = admin.initializeApp({
        credential: admin.credential.cert(join(ROOT_PATH, filePath)),
      })

      this.fcm = app.messaging()
    }

    return this.queue.add(() =>
      pNestRetry(() => this.process(payload), {
        onFailedAttempt: (error: FailedAttemptError) => {
          this.logger.debug(
            `SMS to ${payload.to} failed, retrying (${error.retriesLeft} attempts left)`,
            error,
          )
        },
        retries: this.config.get<number>('notification.push.retries', 1),
      }),
    )
  }

  private process(payload: INotificationPayload): void {
    const result: admin.messaging.BatchResponse = {
      successCount: 0,
      failureCount: 0,
      responses: [],
    }

    const sent = this.fcm.sendEachForMulticast(
      {
        tokens: payload.to.split(','),
        notification: {
          title: payload.subject,
          body: payload.content,
        },
        data: payload?.data,
      },
      this.dryRun,
    )
  }
}
