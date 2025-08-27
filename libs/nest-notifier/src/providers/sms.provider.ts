import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FailedAttemptError, FeatureDisabledException, NestQueue, pNestRetry } from 'lib/nest-core'
import { LoggerService } from 'lib/nest-logger'
import { Twilio } from 'twilio'
import { INotificationPayload } from '../interfaces'

@Injectable()
export class SmsProvider {
  private readonly dryRun: boolean

  private queue = new NestQueue({ concurrency: 1 })
  private twilioClient: Twilio

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.dryRun = this.config.get<boolean>('notification.sms.dryRun')
    this.logger.setContext('sms')
  }

  send(payload: INotificationPayload) {
    if (this.dryRun) {
      throw new FeatureDisabledException(
        `Simulating SMS on Mobile Devices when developing. SMS message: ${payload.content}`,
      )
    }

    if (!this.twilioClient) {
      const twilioAccountSid = this.config.get<string>('notification.sms.twilio.accountSid')
      const twilioAuthToken = this.config.get<string>('notification.sms.twilio.authToken')

      if (!twilioAccountSid || !twilioAuthToken) {
        throw new Error('Twilio account SID/auth token not found')
      }

      this.twilioClient = new Twilio(twilioAccountSid, twilioAuthToken)
    }

    return this.queue.add(() =>
      pNestRetry(() => this.process(payload), {
        onFailedAttempt: (error: FailedAttemptError) => {
          this.logger.debug(
            `SMS to ${payload.to} failed, retrying (${error.retriesLeft} attempts left)`,
            error,
          )
        },
        retries: this.config.get<number>('notification.sms.retries', 1),
      }),
    )
  }

  private process(payload: INotificationPayload): void {
    this.twilioClient.messages.create({
      to: payload.to,
      body: payload.content,
    })
  }
}
