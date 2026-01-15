import { HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppException, LoggerService } from 'lib/nest-core'
import { Twilio } from 'twilio'
import { INotificationPayload } from '../interfaces'

@Injectable()
export class SmsProvider {
  private readonly dryRun: boolean

  private twilioClient: Twilio

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService
  ) {
    this.dryRun = this.config.get<boolean>('notification.sms.dryRun')
  }

  send(payload: INotificationPayload): boolean {
    if (this.dryRun) {
      throw new AppException({
        message: `Simulating SMS on Mobile Devices when developing. SMS message: ${payload.content}`,
        httpStatus: HttpStatus.LOCKED,
      })
    }

    if (!this.twilioClient) {
      const twilioAccountSid = this.config.get<string>('notification.sms.twilio.accountSid')
      const twilioAuthToken = this.config.get<string>('notification.sms.twilio.authToken')

      if (!twilioAccountSid || !twilioAuthToken) {
        throw new Error('Twilio account SID/auth token not found')
      }

      this.twilioClient = new Twilio(twilioAccountSid, twilioAuthToken)
    }

    return this.process(payload)
  }

  private process(payload: INotificationPayload): boolean {
    this.twilioClient.messages.create({
      to: payload.to,
      body: payload.content,
    })
    return true
  }
}
