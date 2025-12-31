import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma } from '@runtime/prisma-client'
import { ArrUtil } from 'lib/nest-core'
import { ENUM_LOGGER_TYPE, LOGGER_MESSAGE_KEY, LoggerService } from 'lib/nest-logger'
import { PrismaClusterManager, PrismaTenantManager } from '../bases'
import { PRISMA_MODULE_OPTION_TOKEN, PRISMA_READ_OPERATIONS } from '../constants'
import {
  ClientProvider,
  ClientWithExtends,
  IPrismaClientConfigOptions,
  IPrismaLoggerHooks,
  IPrismaModuleOptions,
} from '../interfaces'
import { PrismaUtil } from '../utils'

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly debugMode: boolean
  private readonly clusterManager: PrismaClusterManager
  private readonly tenantManager: PrismaTenantManager

  constructor(
    @Inject(PRISMA_MODULE_OPTION_TOKEN) private readonly options: IPrismaModuleOptions,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    this.debugMode = this.config.get<boolean>('database.debug')

    this.logger.setContext(ENUM_LOGGER_TYPE.DATABASE)

    if (this.options.multiTenant) {
      this.tenantManager = new PrismaTenantManager(
        this.config.getOrThrow<IPrismaClientConfigOptions[]>('database.tenant'),
        this.setupLoggerHooks(),
      )
    } else {
      const { writer, readers } = PrismaUtil.setupClient(
        this.config.getOrThrow<ClientProvider>('database.replication.provider'),
        {
          writeUrl: this.config.getOrThrow<string>('database.replication.master'),
          readUrls: this.config.getOrThrow<string[]>('database.replication.slaves'),
          loggerHooks: this.setupLoggerHooks(),
          replication: this.options.replication,
        },
      )
      this.clusterManager = new PrismaClusterManager(writer, readers)
    }
  }

  async onModuleInit() {
    if (this.clusterManager) {
      this.clusterManager.connect()
    }
  }

  async onModuleDestroy() {
    if (this.clusterManager) {
      await this.clusterManager.disconnect()
    }
    if (this.tenantManager) {
      await this.tenantManager.disconnect()
    }
  }

  private async getClients(): Promise<{ writer: ClientWithExtends; reader: ClientWithExtends }> {
    if (this.options.multiTenant) {
      const cluster = await this.tenantManager.pick()
      return cluster.pair()
    }
    return this.clusterManager.pair()
  }

  get client(): ClientWithExtends {
    return new Proxy({} as ClientWithExtends, {
      get: (_, modelName: string) => {
        if (modelName === '$transaction') {
          return async (arg: any, options?: any) => {
            const { writer } = await this.getClients()
            return writer.$transaction(async (tx) => {
              return typeof arg === 'function' ? arg(tx) : arg
            }, options)
          }
        }

        return new Proxy({} as ClientWithExtends, {
          get: (__, method: string) => {
            return async (...args: any[]) => {
              const { writer, reader } = await this.getClients()
              const isRead = ArrUtil.has(PRISMA_READ_OPERATIONS, method)
              const target = isRead ? reader : writer
              return target[modelName][method](...args)
            }
          },
        })
      },
    })
  }

  private setupLoggerHooks(): IPrismaLoggerHooks {
    return this.debugMode
      ? {
          logLevels: [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
            { emit: 'event', level: 'info' },
          ],
          onQuery: this.logQuery.bind(this),
          onError: this.logError.bind(this),
          onWarn: this.logWarn.bind(this),
          onInfo: this.logInfo.bind(this),
        }
      : {
          logLevels: [{ emit: 'event', level: 'error' }],
          onError: this.logError.bind(this),
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
