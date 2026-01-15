import { HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as admin from 'firebase-admin'
import { AppException, FileUtil, LoggerService } from 'lib/nest-core'
import { INotificationPayload } from '../interfaces'

@Injectable()
export class PushProvider {
  private readonly dryRun: boolean

  private fcm: admin.messaging.Messaging

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService
  ) {
    this.dryRun = this.config.get<boolean>('notification.push.dryRun')
  }

  send(payload: INotificationPayload): boolean {
    if (this.dryRun) {
      throw new AppException({
        message: `Simulating push on Mobile Devices when developing. SMS message: ${payload.content}`,
        httpStatus: HttpStatus.LOCKED,
      })
    }

    if (!this.fcm) {
      const filePath = this.config.get<string>('notification.push.firebase.serviceAccountPath')
      const app = admin.initializeApp({
        credential: admin.credential.cert(FileUtil.joinRoot([filePath])),
      })

      this.fcm = app.messaging()
    }

    return this.process(payload)
  }

  private process(payload: INotificationPayload): boolean {
    const _result: admin.messaging.BatchResponse = {
      successCount: 0,
      failureCount: 0,
      responses: [],
    }

    const _sent = this.fcm.sendEachForMulticast(
      {
        tokens: payload.to.split(','),
        notification: {
          title: payload.subject,
          body: payload.content,
        },
        data: payload?.data,
      },
      this.dryRun
    )
    return true
  }
}
