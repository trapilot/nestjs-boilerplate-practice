import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma, PrismaClient } from '@prisma/client'
import { ENUM_LOGGER_TYPE, LoggerService } from 'lib/nest-logger'
import { PrismaContext } from '../contexts'
import { withExtension, withReplica } from '../extensions'
import { ClientWithExtension } from '../interfaces'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly debug: boolean

  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    const debug = config.get<boolean>('database.debug', false)
    super(debug ? { log: [{ emit: 'event', level: 'query' }] } : {})

    this.debug = debug

    this.logger.setContext(ENUM_LOGGER_TYPE.MYSQL)

    const replicas = this.createReplicaClients()
    return this.createExtendedClient(this, replicas) as unknown as PrismaService
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  private createExtendedClient(client: PrismaClient, replicas: PrismaClient[] = []): any {
    if (this.debug) {
      this.attachQueryLogger(client)
    }

    if (replicas.length) {
      return client.$extends(withExtension).$extends(
        withReplica({
          replicas: replicas.map((replica) => {
            return this.createExtendedClient(replica)
          }),
        }),
      )
    }

    return client.$extends(withExtension)
  }

  private createReplicaClients(): PrismaClient[] {
    const urls = process.env.REPLICA_URL?.split(',') ?? []

    return urls.map((url) => {
      return new PrismaClient({
        datasourceUrl: url,
        log: this.debug ? [{ emit: 'event', level: 'query' }] : [],
      })
    })
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

  async $extension<T>(fn: (ex: ClientWithExtension) => Promise<T>) {
    return fn(this as ClientWithExtension)
  }

  async $execution<T>(fn: (ex: ClientWithExtension) => Promise<T>) {
    return PrismaContext.run({ tx: this, forcePrimary: true }, () =>
      fn(this as ClientWithExtension),
    )
  }
}
