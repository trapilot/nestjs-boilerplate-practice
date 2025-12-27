import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { Prisma, PrismaClient } from '@runtime/prisma-client'
import { ENUM_LOGGER_TYPE, LOGGER_MESSAGE_KEY, LoggerService } from 'lib/nest-logger'
import { withExtension, withReplica } from '../extensions'
import { PrismaContext } from '../helpers'
import { ClientWithExtends } from '../interfaces'
import { PrismaUtil } from '../utils'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly isDebugMode: boolean

  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    const primaryUrl = config.get<string>('database.replication.master')
    super(PrismaService.createOptions(primaryUrl))

    this.isDebugMode = this.config.get<boolean>('database.debug')

    this.logger.setContext(this.config.get<ENUM_LOGGER_TYPE>('database.context'))

    return this.setupExtension(this) as unknown as PrismaService
  }

  static createOptions(url: string): any {
    return {
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'info' },
      ],
      errorFormat: 'pretty',
      adapter: new PrismaMariaDb(url),
    }
  }

  async $extension<T>(fn: (ex: ClientWithExtends) => Promise<T>) {
    return fn(this as ClientWithExtends)
  }

  async $execution<T>(fn: (ex: ClientWithExtends) => Promise<T>) {
    return PrismaContext.run({ tx: this, forcePrimary: true }, () => fn(this as ClientWithExtends))
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
      return client
        .$extends(withExtension)
        .$extends(
          withReplica(
            replicaUrls
              .map((url) => new PrismaClient(PrismaService.createOptions(url)))
              .map((replica) => this.setupExtension(replica, false)),
          ),
        )
    }

    return client.$extends(withExtension)
  }

  private setupLogging(client: PrismaClient): void {
    if (this.isDebugMode) {
      ;(client as PrismaService).$on('query', this.logQuery.bind(this))
      ;(client as PrismaService).$on('error', this.logError.bind(this))
      ;(client as PrismaService).$on('warn', this.logWarn.bind(this))
      ;(client as PrismaService).$on('info', this.logInfo.bind(this))
    }
  }

  private logQuery(event: Prisma.QueryEvent): void {
    const { query, duration, params, ...other } = event

    this.logger.debug({
      ...other,
      duration,
      slowQuery: duration > 1000,
      [LOGGER_MESSAGE_KEY]: PrismaUtil.buildQuery(query, { params }),
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
