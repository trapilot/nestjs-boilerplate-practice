import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma, PrismaClient } from '@prisma/client'
import { ENUM_APP_ENVIRONMENT } from 'lib/nest-core'
import { ENUM_LOGGER_TYPE, LoggerService } from 'lib/nest-logger'
import { PrismaReplicaManager } from '../bases/prisma.replica.manager'
import { withExtension } from '../extensions/prisma.extension'
import { ClientWithExtension, IPrismaReplicaParams } from '../interfaces'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly env: ENUM_APP_ENVIRONMENT
  private readonly lazy: boolean
  private readonly debug: boolean

  private master!: ClientWithExtension
  private replicaManager!: PrismaReplicaManager

  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    const debug = config.get<boolean>('database.debug', false)
    super(debug ? { log: [{ emit: 'event', level: 'query' }] } : {})

    this.env = config.get<ENUM_APP_ENVIRONMENT>('app.env')
    this.lazy = config.get<boolean>('database.lazy', false)
    this.debug = debug

    this.logger.setContext(ENUM_LOGGER_TYPE.MYSQL)
  }

  async onModuleInit() {
    this.master = this.createExtendedClient(this)

    this.replicaManager = new PrismaReplicaManager({
      replicas: this.createReplicaClients(),
      defaultReadClient: 'replica',
    })

    if (!this.lazy) {
      await this.connect()
    }
  }

  async onModuleDestroy() {
    await this.disconnect()
  }

  private async connect() {
    await Promise.all([this.$connect(), this.replicaManager?.connect()])
  }

  private async disconnect() {
    await Promise.allSettled([this.$disconnect(), this.replicaManager?.disconnect()])
  }

  private createExtendedClient(client: PrismaClient): ClientWithExtension {
    if (this.debug) {
      this.attachQueryLogger(client)
    }
    return client.$extends(withExtension)
  }

  private createReplicaClients(): ClientWithExtension[] {
    const urls = process.env.REPLICA_URL?.split(',') ?? []

    return urls.map((url) =>
      this.createExtendedClient(
        new PrismaClient({
          datasourceUrl: url,
          log: this.debug ? [{ emit: 'event', level: 'query' }] : [],
        }),
      ),
    )
  }

  private attachQueryLogger(client: PrismaClient, slowMs: number = 3000): void {
    client.$on('query', (e: Prisma.QueryEvent) => {
      if (e.query === 'SELECT 1') return

      try {
        const query = this.formatQuery(e.query, e.params)
        const duration = e.duration

        if (duration >= slowMs) {
          this.logger.warn(`[SLOW] ${query} - ${duration}ms`)
        } else {
          this.logger.debug(`${query};`)
        }
      } catch {
        /* ignore log error */
      }
    })
  }

  private formatQuery(query: string, paramsRaw: string): string {
    const params = JSON.parse(paramsRaw)
    let index = 0

    let sql = query
      .split('?')
      .map((s) => `$${index++}${s}`)
      .join('')
      .substring(index ? 2 : 0)

    params.forEach((value: unknown, i: number) => {
      const re = new RegExp(`\\$${i + 1}(?!\\d)`, 'g')
      const escaped = typeof value === 'string' ? `'${value.replace(/'/g, "\\'")}'` : value
      sql = sql.replace(re, String(escaped))
    })

    return sql
  }

  async $replication<T>(fn: ({ master, slave }: IPrismaReplicaParams) => Promise<T>) {
    return fn({
      master: this.master,
      slave: this.replicaManager.pick(),
    })
  }

  async $extension<T>(fn: (ex: ClientWithExtension) => Promise<T>) {
    return fn(this.master)
  }
}
