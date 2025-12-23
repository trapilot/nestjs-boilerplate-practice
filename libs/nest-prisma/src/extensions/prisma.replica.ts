import { Prisma, PrismaClient } from '@prisma/client/extension'
import { PrismaReplicaManager } from '../bases'
import { IPrismaReplicaOptions } from '../interfaces'

const readOperations = [
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'groupBy',
  'aggregate',
  'count',
  'findRaw',
  'aggregateRaw',
]

export const withReplica = (options: IPrismaReplicaOptions) =>
  Prisma.defineExtension((client: PrismaClient) => {
    const replicaManager = new PrismaReplicaManager(options)

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
      },
      query: {
        $allOperations({
          args,
          model,
          operation,
          query,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          __internalParams: { transaction },
        }) {
          if (transaction) {
            return query(args)
          }

          if (readOperations.includes(operation) && options.defaultReadClient === 'replica') {
            const replica = replicaManager.pick()
            if (replica) {
              return model ? replica[model][operation](args) : replica[operation](args)
            }
          }

          return query(args)
        },
      },
    })
  })
