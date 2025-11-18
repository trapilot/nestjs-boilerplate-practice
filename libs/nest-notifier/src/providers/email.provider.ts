import { HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppException, FailedAttemptError, QueueContext, RetryContext } from 'lib/nest-core'
import { LoggerService } from 'lib/nest-logger'
import { createTransport, Transporter } from 'nodemailer'
import { INotificationPayload } from '../interfaces'

@Injectable()
export class EmailProvider {
  private readonly dryRun: boolean

  private queue = new QueueContext({ concurrency: 1 })
  private transporter!: Transporter

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.dryRun = this.config.get<boolean>('notification.email.dryRun')
    this.logger.setContext('email')
  }

  send(payload: INotificationPayload) {
    if (this.dryRun) {
      throw new AppException({
        message: `Simulating send email when developing.\n
          Subject: ${payload.subject}\n
          Content: ${payload.content}\n`,
        httpStatus: HttpStatus.LOCKED,
      })
    }

    if (!this.transporter) {
      const transportOptions = {
        host: this.config.get<any>('notification.email.host'),
        port: this.config.get<number>('notification.email.port'),
        auth: {
          user: this.config.get<string>('notification.email.user'),
          pass: this.config.get<string>('notification.email.pass'),
        },
      }

      if (transportOptions.host) {
        const transporter = createTransport(transportOptions, {
          from: `No Reply <${transportOptions.auth.user}>`,
        })

        transporter.verify().catch((error: Error) => {
          throw new ReferenceError(
            `Error occurred while verifying the transporter: ${error.message}`,
          )
        })

        this.transporter = transporter
      }
    }

    return this.queue.add(() =>
      RetryContext(() => this.process(payload), {
        onFailedAttempt: (error: FailedAttemptError) => {
          this.logger.debug(
            `Email to ${payload.to} failed, retrying (${error.retriesLeft} attempts left)`,
            error,
          )
        },
        retries: this.config.get<number>('notification.email.retries', 1),
      }),
    )
  }

  private process(payload: INotificationPayload): void {
    this.transporter.sendMail({
      subject: payload?.subject,
      to: payload.to,
      ...payload,
    })
  }
}
