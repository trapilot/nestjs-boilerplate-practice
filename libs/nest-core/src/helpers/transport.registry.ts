import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createTransport, Transporter } from 'nodemailer'
import { ITransportConfig } from '../interfaces'

@Injectable()
export class TransportRegistry {
  private readonly transporters = new Map<string, Transporter>()

  constructor(private readonly config: ConfigService) {}

  async resolve(name?: string): Promise<Transporter> {
    const transportName = name || this.config.get<string>('helper.mailer.defaultTransport')

    if (!transportName) {
      throw new ReferenceError('Transport name is required')
    }

    // Return cached transporter
    if (this.transporters.has(transportName)) {
      return this.transporters.get(transportName)!
    }

    const transportConfig = this.getTransportConfig(transportName)

    const transporter = createTransport(transportConfig.url, {
      from: transportConfig.from,
    })

    try {
      await transporter.verify()
    } catch (error) {
      throw new ReferenceError(
        `Failed to verify transporter "${transportName}": ${(error as Error).message}`,
      )
    }
    // No Reply <noreply@example.com>
    this.transporters.set(transportName, transporter)
    return transporter
  }

  private getTransportConfig(name: string): ITransportConfig {
    const config = this.config.get<ITransportConfig>(`mailer.transports.${name}`)

    if (!config?.url) {
      throw new ReferenceError(`Transport "${name}" is not configured`)
    }

    return config
  }
}
