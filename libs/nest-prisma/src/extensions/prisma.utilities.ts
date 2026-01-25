import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaGenerator,
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
} from '../interfaces'

export const useUtilities = Prisma.defineExtension({
  name: 'prisma-utilities',
  model: {
    $allModels: {
      async exists<T>(this: T, where?: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
        const context = Prisma.getExtensionContext(this)

        const count: Prisma.Args<T, 'count'> = await context['count']({
          where,
          take: 1,
        })

        return count > 0
      },

      async *yield<T, R>(
        this: T,
        where: Prisma.Args<T, 'findMany'>,
        options?: { cursorField?: string; chunkSize?: number },
      ): AsyncGenerator<Prisma.Result<T, R, 'findMany'>, void, unknown> {
        const chunkSize = options?.chunkSize ?? 1000
        const cursorField = options?.cursorField || 'id'
        const cursorValue = { [cursorField]: where?.cursor?.[cursorField] }

        // Avoid select without cursor field
        if (where?.select && !Object.keys(where.select).includes(cursorField)) {
          where.select[cursorField] = true
        }

        const context = Prisma.getExtensionContext(this)
        do {
          const records: Prisma.Args<T, 'findMany'> = await context['findMany']({
            ...where,
            take: chunkSize,
            skip: cursorValue[cursorField] ? 1 : 0,
            cursor: cursorValue[cursorField] ? cursorValue : undefined,
          })

          if (records.length === 0) {
            break // End iteration if no results
          }

          if (where?.take) {
            where.take -= records.length
            if (where.take <= 0) {
              break
            }
          }

          // Update cursor for the next iteration
          cursorValue[cursorField] = records[records.length - 1][cursorField]

          yield records
        } while (true)
      },

      async list<T, R>(
        this: T,
        where?: Prisma.Args<T, 'findMany'>['where'],
        params?: IPrismaParams,
        options?: IPrismaOptions & IPrismaGenerator,
      ): Promise<IPrismaReturnList<R>> {
        const context = Prisma.getExtensionContext(this)

        const { skip, take, cursor, distinct, orderBy } = params ?? {}
        const { select, include } = options ?? {}

        const kwargs = {
          where,
          skip,
          take,
          cursor,
          distinct,
          orderBy,
          select,
          include,
        }

        if (options?.document) {
          const generator = context['yield'](kwargs, {
            cursorField: Object.keys(where?.cursor || {})[0],
          })
          return { data: generator }
        }

        const records: Prisma.Args<T, 'findMany'> = await context['findMany'](kwargs)
        return {
          data: records,
        }
      },

      async paginate<T, R>(
        this: T,
        where?: Prisma.Args<T, 'findMany'>['where'],
        params?: IPrismaParams,
        options?: IPrismaOptions & IPrismaGenerator,
      ): Promise<IPrismaReturnPaging<R>> {
        const context = Prisma.getExtensionContext(this)

        const { skip, take, cursor, distinct, orderBy } = params ?? {}
        const { select, include } = options ?? {}

        const kwargs = {
          where,
          skip,
          take,
          cursor,
          distinct,
          orderBy,
          select,
          include,
        }

        if (options?.document) {
          const generator = context['yield'](kwargs, {
            cursorField: Object.keys(where?.cursor || {})[0],
          })
          return { data: generator }
        }

        const [totalRecord, records] = await Promise.all([
          context['count']({ where: kwargs.where }),
          context['findMany'](kwargs),
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
