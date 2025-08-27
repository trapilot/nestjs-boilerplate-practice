import { Prisma } from '@prisma/client/extension'
import { IResponseList } from 'lib/nest-web'
import { IPrismaIterator, IPrismaOptions, IPrismaParams } from '../interfaces'

type CacheStrategy = {
  swr: number
  ttl: number
}

export const withList = Prisma.defineExtension({
  model: {
    $allModels: {
      async list<T, A>(
        this: T,
        where?: Prisma.Exact<A, Prisma.Args<T, 'findMany'>['where'] & CacheStrategy>,
        params?: IPrismaParams,
        options?: IPrismaOptions & IPrismaIterator,
      ): Promise<IResponseList> {
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
    },
  },
})
