import { Prisma, PrismaClient } from '@runtime/prisma-client'
import {
  IPrismaIterator,
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
} from '../interfaces'

export const withExtension = Prisma.defineExtension({
  model: {
    $allModels: {
      async list<T>(
        this: T,
        where?: Prisma.Args<T, 'findMany'>['where'],
        params?: IPrismaParams,
        options?: IPrismaOptions & IPrismaIterator,
      ): Promise<IPrismaReturnList> {
        const context = Prisma.getExtensionContext(this) as any

        if (options?.bookType) {
          const iterator = context.yield(where, params, options)
          return { data: iterator }
        }

        const { skip, take, cursor, distinct, orderBy } = params ?? {}
        const { select, include } = options ?? {}

        const records = await context.findMany({
          where,
          skip,
          take,
          cursor,
          distinct,
          orderBy,
          select,
          include,
        })
        return {
          data: records,
        }
      },
      async paginate<T>(
        this: T,
        where?: Prisma.Args<T, 'findMany'>['where'],
        params?: IPrismaParams,
        options?: IPrismaOptions & IPrismaIterator,
      ): Promise<IPrismaReturnPaging> {
        const context = Prisma.getExtensionContext(this) as any

        if (options?.bookType) {
          const iterator = context.yield(where, params, options)
          return { data: iterator }
        }

        const { skip, take, cursor, distinct, orderBy } = params ?? {}
        const { select, include } = options ?? {}

        const [totalRecord, records] = await Promise.all([
          context.count({ where }),
          context.findMany({ where, skip, take, cursor, distinct, orderBy, select, include }),
        ])

        return {
          data: records,
          pagination: {
            totalRecord,
            totalPage: Math.max(1, Math.ceil(totalRecord / (take || 1))),
          },
        }
      },
      async *yield<T>(
        this: T,
        where?: Prisma.Args<T, 'findMany'>['where'],
        params?: IPrismaParams,
        options?: IPrismaOptions & IPrismaIterator,
      ): AsyncGenerator<T[], void, unknown> {
        const chunk = options?.chunk || 1_000
        const iterator = options?.iterator !== false
        const cursorField = Object.keys(params?.cursor || {})[0] || 'id'

        const { distinct, orderBy, take } = params ?? {}
        const { select, include } = options ?? {}

        const context = Prisma.getExtensionContext(this) as any
        do {
          const records = await context.findMany({
            where,
            take: iterator ? chunk : take,
            skip: params?.cursor ? 1 : 0,
            cursor: params?.cursor ? { [cursorField]: params.cursor } : undefined,
            distinct,
            orderBy,
            select,
            include,
          })

          if (records.length === 0) {
            break // End iteration if no results
          }

          // Update cursor for the next iteration
          params.cursor = records[records.length - 1][cursorField]

          yield records
        } while (iterator)
      },
    },
  },
})

export const applyExtensions = (client: PrismaClient) => {
  return client.$extends(withExtension)
}
