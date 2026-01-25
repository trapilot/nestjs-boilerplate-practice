import { HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Mail from 'nodemailer/lib/mailer'
import { CircuitBreaker, CircuitCatch, OnFallbackInput } from '../decorators'
import { AppException } from '../exceptions'
import { TransportFactory } from '../helpers'
import { IMailerSendResult } from '../interfaces'
import { AppUtil } from '../utils'

@Injectable()
export class MailerService {
  private readonly dryRun: boolean

  constructor(
    private readonly config: ConfigService,
    private readonly transportFactory: TransportFactory,
  ) {
    this.dryRun = this.config.get<boolean>('helper.mailer.dryRun')
  }

  async send(payload: Mail.Options, transport: string = 'smtp'): Promise<IMailerSendResult> {
    try {
      return await this._send(payload, transport)
    } catch (error: unknown) {
      if (error instanceof AppException) {
        throw error
      }

      throw new AppException({
        message: `Failed to send email: ${AppUtil.catchMessage(error)}`,
        httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
      })
    }
  }

  @CircuitBreaker({
    circuitGroup: 'mailer',
    resolveKey: (args: unknown[]): string => {
      return typeof args[1] === 'string' ? args[1] : 'smtp'
    },
    options: {
      timeout: 3000, // SMTP timeout
    },
  })
  async sendResilient(payload: Mail.Options, transport: string = 'smtp'): Promise<void> {
    await this._send(payload, transport)
  }

  private async _send(payload: Mail.Options, transport: string): Promise<IMailerSendResult> {
    if (this.dryRun) {
      return {
        dryRun: true,
        message: [
          'Simulating email send (dry-run mode)',
          `Subject: ${payload.subject}`,
          `Content: ${payload.html || payload.text}`,
        ].join('\n'),
      }
    }

    const transporter = await this.transportFactory.getTransporter(transport)
    await transporter.sendMail(payload)

    return {
      dryRun: false,
      message: 'OK',
    }
  }

  @CircuitCatch({ eventName: 'open', circuitGroup: 'mailer:smtp' })
  onCircuitOpen() {
    console.error('[SMTP] Circuit OPEN')
  }

  @CircuitCatch({ eventName: 'halfOpen', circuitGroup: 'mailer:smtp' })
  onCircuitHalfOpen() {
    console.warn('[SMTP] Circuit HALF_OPEN')
  }

  @CircuitCatch({ eventName: 'close', circuitGroup: 'mailer:smtp' })
  onCircuitClose() {
    console.log('[SMTP] Circuit CLOSED')
  }

  @CircuitCatch({ eventName: 'failure', circuitGroup: 'mailer:smtp' })
  onFailure({ err, latencyMs }: { err: Error; latencyMs: number }) {
    console.error('[SMTP] Failure', err.message, latencyMs)
  }

  @CircuitCatch({ eventName: 'success', circuitGroup: 'mailer:smtp' })
  onSuccess({ latencyMs }: { latencyMs: number }) {
    console.log('[SMTP] Success', latencyMs)
  }

  @CircuitCatch({ eventName: 'fallback', circuitGroup: 'mailer:smtp' })
  async fallback({ input, err }: OnFallbackInput): Promise<IMailerSendResult> {
    console.error('[SMTP] Fallback triggered', err.message)

    try {
      const [payload] = input as [Mail.Options]
      const transporter = await this.transportFactory.getTransporter('failover')

      await transporter.sendMail(payload)

      return {
        dryRun: false,
        message: 'Sent via fallback transport',
      }
    } catch (fallbackError) {
      console.error('[SMTP][Fallback][Fail]', AppUtil.catchMessage(fallbackError))
      throw fallbackError
    }
  }
}
