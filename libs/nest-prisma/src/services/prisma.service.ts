import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma, PrismaClient } from '@prisma/client'
import { AsyncLocalStorage } from 'async_hooks'
import { ENUM_APP_ENVIRONMENT } from 'lib/nest-core'
import { ENUM_LOGGER_TYPE, LoggerService } from 'lib/nest-logger'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { withList, withPaginate, withReplica, withYield } from '../extensions'
import {
  IPrismaContext,
  ListingPrismaClient,
  PagingPrismaClient,
  ReplicaPrismaClient,
  YieldPrismaClient,
} from '../interfaces'

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit
{
  private readonly env: ENUM_APP_ENVIRONMENT
  private readonly lazy: boolean
  private readonly debug: boolean
  private _replicaClients: ReplicaPrismaClient[] = []
  private _roundRobinIndex = 0

  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly storage: AsyncLocalStorage<IPrismaContext>,
  ) {
    const debug = config.get<boolean>('database.debug', false)
    super(debug ? { log: [{ emit: 'event', level: 'query' }] } : {})

    this.env = this.config.get<ENUM_APP_ENVIRONMENT>('app.env')
    this.lazy = this.config.get<boolean>('database.lazy', false)

    this.debug = debug
    this.logger.setContext(ENUM_LOGGER_TYPE.MYSQL)
  }

  async onModuleDestroy() {
    await this.disconnect()
  }

  private async connect() {
    await this.$connect()
    await Promise.all(this._replicaClients.map((replica) => replica.$connect()))
  }

  private async disconnect() {
    await this.$disconnect()
    await Promise.all(this._replicaClients.map((replica) => replica.$disconnect()))
  }

  async onModuleInit() {
    // setup replicas
    const replicaUrls = process.env.REPLICA_URL?.split(',') || []
    this._replicaClients = replicaUrls.map((datasourceUrl) => {
      return new PrismaClient({ datasourceUrl }).$extends(withReplica)
    })

    if (this.debug) {
      this.$on('query', (e: Prisma.QueryEvent) => {
        try {
          if (e.query !== 'SELECT 1') {
            const params = JSON.parse(e.params)
            let k = 0
            let query = e.query
              .split('?')
              .map((s) => `$${k++}${s}`)
              .join('')
              .substring(k ? 2 : 0)

            for (let i = 0; i < params.length; i++) {
              // Negative lookahead for no more numbers, ie. replace $1 in '$1' but not '$11'
              const re = new RegExp('\\$' + ((i as number) + 1) + '(?!\\d)', 'g')
              if (typeof params[i] === 'string') {
                params[i] = "'" + params[i].replace("'", "\\'") + "'"
              }
              query = query.replace(re, params[i])
            }

            if (this.env !== ENUM_APP_ENVIRONMENT.DEVELOPMENT) {
              if (e.duration < 1_000) {
                console.log(`\n\x1b[32m${query};\x1b[0m`)
              } else {
                console.log(`\n\x1b[32m${query};\x1b[0m \x1b[33m#${e.duration}ms\x1b[0m`)
              }
            }

            this.logger.debug(`${query};`)
          }
        } catch (err: unknown) {}
      })
    }

    if (!this.lazy) {
      await this.connect()
    }
  }

  async $paginate(fn: (ex: PagingPrismaClient) => Promise<IResponsePaging>) {
    return await fn(this.$extends(withPaginate).$extends(withYield))
  }

  async $listing(fn: (ex: ListingPrismaClient) => Promise<IResponseList>) {
    return await fn(this.$extends(withList).$extends(withYield))
  }

  async $yield(fn: (ex: YieldPrismaClient) => Promise<any>) {
    return await fn(this.$extends(withYield))
  }

  withReplica(): ReplicaPrismaClient | PrismaClient | Prisma.TransactionClient {
    // Check if a transaction is currently active in the request's context
    const ctxPrisma = this.storage.getStore()?.prisma

    // If a transaction is in progress, return the transaction client.
    // This ensures data consistency and avoids opening a separate replica connection.
    if (ctxPrisma) {
      return ctxPrisma
    }

    // If no transaction is active, use the round-robin logic to select a replica client
    if (!this._replicaClients.length) {
      // Fallback to the primary client if no replicas are configured
      // Note: `this` is a PrismaClient instance
      return this
    }

    const client = this._replicaClients[this._roundRobinIndex]
    this._roundRobinIndex = (this._roundRobinIndex + 1) % this._replicaClients.length

    return client
  }

  withChannel(): Prisma.TransactionClient {
    const ctxPrisma = this.storage.getStore()?.prisma
    return ctxPrisma ? ctxPrisma : this
  }

  async makeChannel(fn: (tx: Prisma.TransactionClient) => Promise<any>): Promise<any> {
    const context = this.storage.getStore()

    if (context?.prisma) {
      await fn(context.prisma)
    } else {
      await this.$transaction(async (tx) => {
        await this.storage.run({}, async () => {
          const context = this.storage.getStore()!
          context.prisma = tx

          try {
            await fn(tx)
          } catch (err) {
            const context = this.storage.getStore()!
            if (context) {
              context.prisma = null
            }
            throw err
          }
        })
      })
    }
  }
}
