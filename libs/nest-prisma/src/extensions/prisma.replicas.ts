import { Prisma, PrismaClient } from '@prisma/client/extension'
import { PRISMA_READ_OPERATIONS } from '../constants'
import { PrismaContext } from '../contexts'

export const useReplicas = (clients: PrismaClient[]) =>
  Prisma.defineExtension((client: PrismaClient) => {
    const replicaManager = new PrismaReplicaManager(clients)

    return client.$extends({
      client: {
        async $connect() {
          await Promise.all([(client as PrismaClient).$connect(), replicaManager.connect()])
        },

        async $disconnect() {
          await Promise.all([(client as PrismaClient).$disconnect(), replicaManager.disconnect()])
        },

        async $transaction(args: any, options?: any) {
          const originalClient = client as any

          // Interactive transaction
          if (typeof args === 'function') {
            return originalClient.$transaction(async (tx: PrismaClient) => {
              return PrismaContext.run({ client: tx }, async () => {
                return args(tx)
              })
            }, options)
          }
          // Batch transaction
          return originalClient.$transaction(args, options)
        },
      },
      query: {
        $allOperations({ args, model, operation, query, ...rest }) {
          // If this query already in a Prisma transaction (safety net)
          if ((rest as any).__internalParams.transaction) {
            return query(args)
          }

          // If you have a CLS client, use it immediately
          if (PrismaContext.hasClient()) {
            const client = PrismaContext.getClientOrThrow() as any
            return model ? client[model][operation](args) : client[operation](args)
          }

          // Read → replica
          if (PRISMA_READ_OPERATIONS.includes(operation)) {
            const replica = replicaManager.pick()
            if (replica) {
              return model ? replica[model][operation](args) : replica[operation](args)
            }
          }

          // Fallback → default client
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
      await Promise.all(this.clients.map(client => client.$connect()))
    }
  }

  async disconnect() {
    if (this.clients.length) {
      await Promise.all(this.clients.map(client => client.$disconnect()))
    }
  }

  pick(): PrismaClient {
    const client = this.clients[this.cursor]
    this.cursor = (this.cursor + 1) % this.clients.length

    return client
  }
}
