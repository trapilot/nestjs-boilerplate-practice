import { Inject, Injectable, OnModuleDestroy, OnModuleInit, Type } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClientExtends } from '@prisma/client/extension'
import { Prisma, PrismaClient } from '@runtime/prisma-client'
import { IDatabaseProvider, LOGGER_MESSAGE_KEY, LoggerService } from 'lib/nest-core'
import { PRISMA_OPTIONS } from '../constants'
import { useReplicas, useUtilities } from '../extensions'
import { IPrismaClientOptions, IPrismaModuleOptions } from '../interfaces'
import { PrismaUtil } from '../utils'

const PrismaExtensionService = class {
  constructor(client: PrismaClientExtension) {
    return client.withExtensions()
  }
} as Type<ReturnType<PrismaClientExtension['withExtensions']>>

@Injectable()
export class PrismaService extends PrismaExtensionService {
  constructor(
    @Inject(PRISMA_OPTIONS) private readonly options: IPrismaModuleOptions,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const client = new PrismaClientExtension(
      {
        replication: options.replication,
        provider: config.getOrThrow<IDatabaseProvider>('database.replication.provider'),
        writeUrl: config.getOrThrow<string>('database.replication.master'),
        readUrls: config.get<string[]>('database.replication.slaves', []),
        debugMode: config.get<boolean>('database.debug', false),
      },
      logger,
    )

    super(client)
  }
}

class PrismaClientExtension extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly context: string
  private readonly replicas: PrismaClientExtends[]

  constructor(
    private readonly options: IPrismaClientOptions,
    private readonly logger: LoggerService,
  ) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'info' },
      ],
      errorFormat: 'pretty',
      adapter: PrismaUtil.createAdapter(options.provider, {
        url: options.writeUrl,
      }),
    })

    this.context = options.provider
    this.replicas = options.replication
      ? options.readUrls.map((readUrl: string) => {
          const replica = new PrismaClient({
            log: [
              { emit: 'event', level: 'query' },
              { emit: 'event', level: 'error' },
              { emit: 'event', level: 'warn' },
              { emit: 'event', level: 'info' },
            ],
            errorFormat: 'pretty',
            adapter: PrismaUtil.createAdapter(options.provider, { url: readUrl }),
          })
          this.setupLogging(replica as PrismaClientExtension)
          return replica.$extends(useUtilities) as PrismaClientExtends
        })
      : []

    this.setupLogging(this)
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.connect()
    } catch (error: unknown) {
      this.logger.error(error, 'Prisma failed to initialize database service', this.context)
      throw error
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect()
  }

  private async connect(): Promise<void> {
    try {
      await this.$connect()
      this.logger.log('Prisma connected to the database', this.context)
    } catch (error: unknown) {
      this.logger.error(error, 'Prisma failed to connect to the database', this.context)
      throw error
    }
  }

  private async disconnect(): Promise<void> {
    try {
      await this.$disconnect()
      this.logger.log('Prisma disconnected from the database', this.context)
    } catch (error: unknown) {
      this.logger.error(error, 'Prisma failed to disconnect from the database', this.context)
      throw error
    }
  }

  private setupLogging(client: PrismaClientExtension): void {
    if (this.options.debugMode) {
      client.$on('query', this.logQuery.bind(this))
      client.$on('error', this.logError.bind(this))
      client.$on('warn', this.logWarn.bind(this))
      client.$on('info', this.logInfo.bind(this))
    }
  }

  private logQuery(event: Prisma.QueryEvent): void {
    const { query, duration, params, ...other } = event

    this.logger.debug(
      {
        ...other,
        duration,
        slowQuery: duration > 1000,
        [LOGGER_MESSAGE_KEY]: PrismaUtil.buildQuery(query, { params }),
      },
      this.context,
    )
  }

  private logError(event: Prisma.LogEvent): void {
    this.logger.error(event, this.context)
  }

  private logWarn(event: Prisma.LogEvent): void {
    this.logger.warn(event, this.context)
  }

  private logInfo(event: Prisma.LogEvent): void {
    this.logger.log(event, this.context)
  }

  withExtensions() {
    return this.$extends(useUtilities).$extends(useReplicas(this.replicas))
  }
}
