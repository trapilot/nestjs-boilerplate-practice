import { Prisma } from '@runtime/prisma-client'
import { IPrismaExportOptions, IPrismaReturnList, IPrismaReturnPaging } from '../interfaces'

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
        kwargs: Prisma.Args<T, 'findMany'>,
        options?: { cursorField?: string; batchSize?: number },
      ): AsyncGenerator<Prisma.Result<T, R, 'findMany'>, void, unknown> {
        const batchSize = options?.batchSize || 100
        const cursorField = options?.cursorField || 'id'
        const cursorValue = { [cursorField]: kwargs?.cursor?.[cursorField] }

        // Avoid select without cursor field
        if (kwargs?.select && !Object.keys(kwargs.select).includes(cursorField)) {
          kwargs.select[cursorField] = true
        }

        const context = Prisma.getExtensionContext(this)
        do {
          const records: Prisma.Args<T, 'findMany'> = await context['findMany']({
            ...kwargs,
            take: batchSize,
            skip: cursorValue[cursorField] ? 1 : 0,
            cursor: cursorValue[cursorField] ? cursorValue : undefined,
          })

          if (records.length === 0) {
            break // End iteration if no results
          }

          /*
          if (kwargs?.take) {
            kwargs.take -= records.length
            if (kwargs.take <= 0) {
              break
            }
          }
          */

          // Update cursor for the next iteration
          cursorValue[cursorField] = records[records.length - 1][cursorField]

          yield records
        } while (true)
      },

      async list<T, R>(
        this: T,
        kwargs?: Prisma.Args<T, 'findMany'>,
        options?: IPrismaExportOptions,
      ): Promise<IPrismaReturnList<R>> {
        const context = Prisma.getExtensionContext(this)

        if (options?.document) {
          const generator = context['yield'](kwargs, {
            cursorField: Object.keys(kwargs?.cursor || {})[0],
            batchSize: options?.batchSize,
          })
          return {
            data: generator,
            filePrefix: options?.filePrefix,
            fileTimestamp: options?.fileTimestamp,
          }
        }

        const records: Prisma.Args<T, 'findMany'> = await context['findMany'](kwargs)
        return {
          data: records,
        }
      },

      async paginate<T, R>(
        this: T,
        kwargs?: Prisma.Args<T, 'findMany'>,
        options?: IPrismaExportOptions,
      ): Promise<IPrismaReturnPaging<R>> {
        const context = Prisma.getExtensionContext(this)

        if (options?.document) {
          const generator = context['yield'](kwargs, {
            cursorField: Object.keys(kwargs?.cursor || {})[0],
            batchSize: options?.batchSize,
          })
          return {
            data: generator,
            filePrefix: options?.filePrefix,
            fileTimestamp: options?.fileTimestamp,
          }
        }

        const [totalRecord, records] = await Promise.all([
          context['count']({ where: kwargs?.where }),
          context['findMany'](kwargs),
        ])

        return {
          data: records,
          pagination: {
            totalRecord,
            totalPage: Math.max(1, Math.ceil(totalRecord / (kwargs?.take || 1))),
          },
        }
      },
    },
  },
})
