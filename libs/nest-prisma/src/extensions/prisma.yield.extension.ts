import { Prisma } from '@prisma/client/extension'
import { IPrismaIterator, IPrismaOptions, IPrismaParams } from '../interfaces'

export const withYield = Prisma.defineExtension({
  model: {
    $allModels: {
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
