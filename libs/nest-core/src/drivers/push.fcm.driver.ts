import { ConfigService } from '@nestjs/config'
import * as admin from 'firebase-admin'
import { IConfigPush, IPushSendPayload, IPushSendResult, PushDriver } from '../interfaces'

export class PushFcmDriver implements PushDriver {
  readonly name = 'fcm'
  private readonly dryRun: boolean

  constructor(config: ConfigService) {
    const { dryRun, drivers } = config.get<IConfigPush>('push')

    this.dryRun = dryRun

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(drivers.firebase.serviceAccountPath),
      })
    }
  }

  async send<T = { [key: string]: string }>(
    payload: IPushSendPayload<T>,
  ): Promise<IPushSendResult> {
    const id = await admin.messaging().send(
      {
        token: payload.token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data as { [key: string]: string },
      },
      this.dryRun,
    )

    return {
      vendor: this.name,
      messageId: id,
    }
  }
}
