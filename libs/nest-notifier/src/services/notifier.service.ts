import { Injectable } from '@nestjs/common'
import { INotificationPayload } from '../interfaces'
import { EmailProvider, PushProvider, SmsProvider } from '../providers'

@Injectable()
export class NotifierService {
  constructor(
    private readonly emailProvider: EmailProvider,
    private readonly smsProvider: SmsProvider,
    private readonly pushProvider: PushProvider,
  ) {}

  async sendSms(notification: INotificationPayload): Promise<boolean> {
    this.smsProvider.send(notification)
    return true
  }

  async sendEmail(notification: INotificationPayload): Promise<boolean> {
    this.emailProvider.send(notification)
    return true
  }

  async sendMessage(notification: INotificationPayload): Promise<boolean> {
    this.pushProvider.send(notification)
    return true
  }
}
