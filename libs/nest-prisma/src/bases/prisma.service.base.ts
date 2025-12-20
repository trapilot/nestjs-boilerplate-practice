import { Prisma, PrismaClient } from '@prisma/client'
import { AsyncLocalStorage } from 'async_hooks'
import { ExtendedPrismaClient, IPrismaContext } from '../interfaces'

export abstract class PrismaServiceBase extends PrismaClient<
  Prisma.PrismaClientOptions,
  Prisma.LogLevel
> {
  protected _connected = false
  protected _replicaClients: PrismaClient[] = []
  protected _extendedClient: ExtendedPrismaClient
  protected _roundRobinIndex = 0

  constructor(
    options: Prisma.PrismaClientOptions,
    protected readonly storage: AsyncLocalStorage<IPrismaContext>,
  ) {
    super(options)
  }

  protected async connect(): Promise<void> {
    if (this._connected) return

    const clients = [this, ...this._replicaClients]
    await Promise.all(clients.map((c) => c.$connect()))
    this._connected = true
  }

  protected async disconnect(): Promise<void> {
    if (!this._connected) return

    const clients = [this, ...this._replicaClients]
    await Promise.all(clients.map((c) => c.$disconnect()))
    this._connected = false
  }

  protected getReplica(): PrismaClient | Prisma.TransactionClient {
    const ctxPrisma = this.storage.getStore()?.prisma
    if (ctxPrisma) return ctxPrisma
    if (!this._replicaClients.length) return this

    const client = this._replicaClients[this._roundRobinIndex]
    this._roundRobinIndex = (this._roundRobinIndex + 1) % this._replicaClients.length
    return client
  }

  protected getChannel(): Prisma.TransactionClient {
    return this.storage.getStore()?.prisma ?? this
  }

  async makeChannel(fn: (tx: Prisma.TransactionClient) => Promise<any>) {
    const ctx = this.storage.getStore()
    if (ctx?.prisma) return fn(ctx.prisma)

    return this.$transaction(async (tx: Prisma.TransactionClient) => {
      await this.storage.run({}, async () => {
        const store = this.storage.getStore()!
        store.prisma = tx
        try {
          await fn(tx)
        } finally {
          store.prisma = null
        }
      })
    })
  }
}
