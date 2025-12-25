import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma, PrismaClient } from '@prisma/client'
import { ENUM_LOGGER_TYPE, LOGGER_MESSAGE_KEY, LoggerService } from 'lib/nest-logger'
import { PrismaContext } from '../contexts'
import { withExtension, withReplica } from '../extensions'
import { ClientWithExtension } from '../interfaces'

const defaultClientOptions: Prisma.PrismaClientOptions = {
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'info' },
  ],
  errorFormat: 'pretty',
}

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error' | 'warn' | 'info'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly isDebugMode: boolean

  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    super(defaultClientOptions)

    this.isDebugMode = this.config.get<boolean>('database.debug')

    this.logger.setContext(this.config.get<ENUM_LOGGER_TYPE>('database.context'))

    return this.setupExtension(this) as unknown as PrismaService
  }

  async $extension<T>(fn: (ex: ClientWithExtension) => Promise<T>) {
    return fn(this as ClientWithExtension)
  }

  async $execution<T>(fn: (ex: ClientWithExtension) => Promise<T>) {
    return PrismaContext.run({ tx: this, forcePrimary: true }, () =>
      fn(this as ClientWithExtension),
    )
  }

  async onModuleInit() {
    try {
      await this.connect()
    } catch (error: unknown) {
      this.logger.error('Failed to initialize database service', error)
      throw error
    }
  }

  async onModuleDestroy() {
    await this.disconnect()
  }

  private async connect(): Promise<void> {
    try {
      await this.$connect()
      this.logger.log('Successfully connected to the database')
    } catch (error: unknown) {
      this.logger.error('Failed to connect to the database', error)
      throw error
    }
  }

  private async disconnect(): Promise<void> {
    try {
      await this.$disconnect()
      this.logger.log('Successfully disconnected from the database')
    } catch (error: unknown) {
      this.logger.error('Failed to disconnect from the database', error)
      throw error
    }
  }

  private setupExtension(client: PrismaClient, isPrimary: boolean = true): any {
    if (this.isDebugMode) {
      this.setupLogging(client)
    }

    if (isPrimary) {
      const replicaUrls = this.config.get<string[]>('database.replication.slaves')
      return client.$extends(withExtension).$extends(
        withReplica({
          replicas: replicaUrls
            .map((url) => new PrismaClient({ ...defaultClientOptions, datasourceUrl: url }))
            .map((replica) => this.setupExtension(replica, false)),
        }),
      )
    }

    return client.$extends(withExtension)
  }

  private setupLogging(client: PrismaClient): void {
    if (this.isDebugMode) {
      client.$on('query', this.logQuery.bind(this))
      client.$on('error', this.logError.bind(this))
      client.$on('warn', this.logWarn.bind(this))
      client.$on('info', this.logInfo.bind(this))
    }
  }

  private logQuery(event: Prisma.QueryEvent): void {
    const { query, duration, params, ...other } = event

    let index = 0
    let message = query
      .split('?')
      .map((s) => `$${index++}${s}`)
      .join('')
      .substring(index ? 2 : 0)

    JSON.parse(params).forEach((value: unknown, i: number) => {
      const re = new RegExp(`\\$${i + 1}(?!\\d)`, 'g')
      const escaped = typeof value === 'string' ? `'${value.replace(/'/g, "\\'")}'` : value
      message = message.replace(re, String(escaped))
    })

    this.logger.debug({
      ...other,
      duration,
      slowQuery: duration > 1000,
      [LOGGER_MESSAGE_KEY]: message,
    })
  }

  private logError(event: Prisma.LogEvent): void {
    this.logger.error(event)
  }

  private logWarn(event: Prisma.LogEvent): void {
    this.logger.warn(event)
  }

  private logInfo(event: Prisma.LogEvent): void {
    this.logger.log(event)
  }
}
