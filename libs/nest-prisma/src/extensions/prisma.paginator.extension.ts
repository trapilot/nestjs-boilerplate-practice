import { Prisma } from '@prisma/client/extension'
import { IResponsePaging } from 'lib/nest-web'
import { IPrismaIterator, IPrismaOptions, IPrismaParams } from '../interfaces'

export const withPaginate = Prisma.defineExtension({
  model: {
    $allModels: {
      async paginate<T>(
        this: T,
        where?: Prisma.Args<T, 'findMany'>['where'],
        params?: IPrismaParams,
        options?: IPrismaOptions & IPrismaIterator,
      ): Promise<IResponsePaging> {
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
    },
  },
})
