import { ConfigService } from '@nestjs/config'
import twilio from 'twilio'
import { IConfigSms, ISmsSendPayload, ISmsSendResult, SmsDriver } from '../interfaces'

export class SmsTwilioDriver implements SmsDriver {
  readonly name = 'twilio'
  private readonly client: twilio.Twilio
  private readonly sender: string
  private readonly dryRun: boolean

  constructor(config: ConfigService) {
    const options = config.get<IConfigSms>('sms')

    this.dryRun = options.dryRun
    this.sender = options.drivers.twilio.sender
    this.client = twilio(options.drivers.twilio.accountSid, options.drivers.twilio.authToken)
  }

  async send(payload: ISmsSendPayload): Promise<ISmsSendResult> {
    if (this.dryRun) {
      return {
        vendor: this.name,
        dryRun: true,
      }
    }

    const res = await this.client.messages.create({
      from: this.sender,
      to: payload.phone,
      body: payload.message,
    })

    return {
      vendor: this.name,
      messageId: res.sid,
    }
  }
}
