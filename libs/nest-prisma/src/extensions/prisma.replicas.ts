import { Prisma, PrismaClient } from '@prisma/client/extension'
import { PRISMA_READ_OPERATIONS } from '../constants'

export const useReplicas = (clients: PrismaClient[]) =>
  Prisma.defineExtension((client: PrismaClient) => {
    const replicaManager = new PrismaReplicaManager(clients)

    return client.$extends({
      client: {
        $primary<T extends object>(this: T): Omit<T, '$primary' | '$replica'> {
          const context = Prisma.getExtensionContext(this) as PrismaClient
          // If we're in a transaction, the current client is connected to the primary.
          if (!('$transaction' in context && typeof context.$transaction === 'function')) {
            return context
          }
          return client as unknown as Omit<T, '$primary' | '$replica'>
        },

        $replica<T extends object>(this: T): Omit<T, '$primary' | '$replica'> {
          const context = Prisma.getExtensionContext(this) as PrismaClient
          // If we're in a transaction, the current client is connected to the primary.
          if (!('$transaction' in context && typeof context.$transaction === 'function')) {
            throw new Error(`Cannot use $replica inside of a transaction`)
          }
          return replicaManager.pick() as unknown as Omit<T, '$primary' | '$replica'>
        },

        async $connect() {
          await Promise.all([(client as PrismaClient).$connect(), replicaManager.connect()])
        },

        async $disconnect() {
          await Promise.all([(client as PrismaClient).$disconnect(), replicaManager.disconnect()])
        },

        async $transaction(args: any, options?: any) {
          const originalClient = client as any
          return originalClient.$transaction(args, options)
        },
      },
      query: {
        $allOperations({ args, model, operation, query, ...rest }) {
          // Check if this query already runs within a transaction
          if ((rest as any).__internalParams.transaction) {
            return query(args)
          }

          // read operation + default = replica
          if (PRISMA_READ_OPERATIONS.includes(operation)) {
            const replica = replicaManager.pick()
            if (replica) {
              return model ? replica[model][operation](args) : replica[operation](args)
            }
          }

          // fallback
          return query(args)
        },
      },
    })
  })

class PrismaReplicaManager {
  private cursor: number = 0
  private clients: PrismaClient[]

  constructor(clients: PrismaClient[]) {
    this.clients = clients
  }

  async connect() {
    if (this.clients.length) {
      await Promise.all(this.clients.map((client) => client.$connect()))
    }
  }

  async disconnect() {
    if (this.clients.length) {
      await Promise.all(this.clients.map((client) => client.$disconnect()))
    }
  }

  pick(): PrismaClient {
    const client = this.clients[this.cursor]
    this.cursor = (this.cursor + 1) % this.clients.length

    return client
  }
}
