import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma, PrismaClient } from '@prisma/client'
import { AsyncLocalStorage } from 'async_hooks'
import { ENUM_APP_ENVIRONMENT } from 'lib/nest-core'
import { ENUM_LOGGER_TYPE, LoggerService } from 'lib/nest-logger'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { PrismaServiceBase } from '../bases'
import { withList, withPaginate, withReplica, withYield } from '../extensions'
import {
  ClientWithList,
  ClientWithPaginate,
  ClientWithYield,
  ExtendedPrismaClient,
  IPrismaContext,
} from '../interfaces'

@Injectable()
export class PrismaService extends PrismaServiceBase implements OnModuleInit, OnModuleDestroy {
  private env: ENUM_APP_ENVIRONMENT
  private debug: boolean

  constructor(
    protected readonly config: ConfigService,
    protected readonly logger: LoggerService,
    protected readonly storage: AsyncLocalStorage<IPrismaContext>,
  ) {
    const env = config.get<ENUM_APP_ENVIRONMENT>('app.env')
    const debug = config.get<boolean>('database.debug', false)

    super(debug ? { log: [{ emit: 'event', level: 'query' }] } : {}, storage)

    this.env = env
    this.debug = debug

    this.logger.setContext(ENUM_LOGGER_TYPE.MYSQL)

    this.registerDebugLog(this)
  }

  registerDebugLog(client: PrismaClient) {
    if (!this.debug) return

    client.$on('query', (e: Prisma.QueryEvent) => {
      if (e.query === 'SELECT 1') return

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

      if (e.duration >= 3000) {
        this.logger.warn(`[SLOW] ${query} - ${e.duration}ms`)
      } else {
        this.logger.debug(`${query} - ${e.duration}ms`)
      }
    })
  }

  async onModuleInit() {
    this._extendedClient = this.$extends(withYield)
      .$extends(withList)
      .$extends(withPaginate) as unknown as ExtendedPrismaClient

    this._replicaClients = (process.env.REPLICA_URL?.split(',') || []).map((url) => {
      const client = new PrismaClient({
        datasourceUrl: url,
        log: this.debug ? [{ emit: 'event', level: 'query' }] : [],
      })
      return client.$extends(withReplica) as unknown as PrismaClient
    })

    await this.connect()
  }

  async onModuleDestroy() {
    await this.disconnect()
  }

  // -------------------
  // Extension Wrappers
  // -------------------

  async $paginate(fn: (ex: ClientWithPaginate) => Promise<IResponsePaging>) {
    return fn(this._extendedClient)
  }

  async $listing(fn: (ex: ClientWithList) => Promise<IResponseList>) {
    return fn(this._extendedClient)
  }

  async $yield(fn: (ex: ClientWithYield) => Promise<any>) {
    return fn(this._extendedClient)
  }

  withReplica(): PrismaClient | Prisma.TransactionClient {
    return super.getReplica()
  }

  withChannel(): Prisma.TransactionClient {
    return super.getChannel()
  }
}
