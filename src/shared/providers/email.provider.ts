import { HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppException, LoggerService } from 'lib/nest-core'
import { Transporter, createTransport } from 'nodemailer'
import { INotificationPayload } from '../interfaces'

@Injectable()
export class EmailProvider {
  private readonly dryRun: boolean

  private transporter!: Transporter

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService
  ) {
    this.dryRun = this.config.get<boolean>('notification.email.dryRun')
  }

  send(payload: INotificationPayload): boolean {
    if (this.dryRun) {
      throw new AppException({
        message: `Simulating send email when developing.\n
          Subject: ${payload.subject}\n
          Content: ${payload.content}\n`,
        httpStatus: HttpStatus.LOCKED,
      })
    }

    if (!this.transporter) {
      const transportUrl = this.config.get<string>('notification.email.transport')
      if (transportUrl) {
        const transporter = createTransport(transportUrl, {
          from: `No Reply <${this.config.get<string>('notification.email.noReply')}>`,
        })

        transporter.verify().catch((error: Error) => {
          throw new ReferenceError(
            `Error occurred while verifying the transporter: ${error.message}`
          )
        })

        this.transporter = transporter
      }
    }

    return this.process(payload)
  }

  private process(payload: INotificationPayload): boolean {
    this.transporter.sendMail({
      subject: payload?.subject,
      to: payload.to,
      ...payload,
    })
    return true
  }
}
