import { ConfigService } from '@nestjs/config'
import * as OneSignal from '@onesignal/node-onesignal'
import { IConfigPush, IPushSendPayload, IPushSendResult, PushDriver } from '../interfaces'
import { PromiseDefaultApi } from '@onesignal/node-onesignal/dist/types/PromiseAPI'

export class PushOneSignalDriver implements PushDriver {
  readonly name = 'onesignal'
  private readonly dryRun: boolean
  private readonly client: PromiseDefaultApi
  private readonly appName: string

  constructor(config: ConfigService) {
    const { dryRun, drivers } = config.get<IConfigPush>('push')

    this.dryRun = dryRun
    this.appName = drivers.onesignal.appId

    if (!this.client) {
      const configuration = OneSignal.createConfiguration(drivers.onesignal.parameters)
      this.client = new OneSignal.DefaultApi(configuration)
    }
  }

  async send<T = { [key: string]: string }>(
    payload: IPushSendPayload<T>,
  ): Promise<IPushSendResult> {
    if (this.dryRun) {
      return { vendor: this.name, dryRun: true, metadata: { app: this.appName } }
    }

    const notification = new OneSignal.Notification()
    notification.app_id = this.appName
    // Name property may be required in some case, for instance when sending an SMS.
    notification.name = payload.title
    notification.contents = {
      en: payload.body,
    }

    // required for Huawei
    notification.headings = {
      en: payload.title,
    }

    const sent = await this.client.createNotification(notification)

    return {
      vendor: this.name,
      messageId: sent.id,
      metadata: {
        app: this.appName,
      },
    }
  }
}
