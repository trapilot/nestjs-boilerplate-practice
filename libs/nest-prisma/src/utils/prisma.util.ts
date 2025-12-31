import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaPg } from '@prisma/adapter-pg'
import * as runtime from '@prisma/client/runtime/client'
import { Prisma, PrismaClient } from '@runtime/prisma-client'
import { MESSAGE_LANGUAGES } from 'lib/nest-core'
import { applyExtensions } from '../extensions'
import {
  ClientProvider,
  ClientWithExtends,
  IPrismaAdapterCreateOptions,
  IPrismaClientCreateOptions,
  IPrismaLanguageBuildOptions,
  IPrismaLoggerHooks,
} from '../interfaces'

export class PrismaUtil {
  static buildQuery(rawQuery: string, options: { params: string }): string {
    let index = 0
    let query = rawQuery
      .split('?')
      .map((s) => `$${index++}${s}`)
      .join('')
      .substring(index ? 2 : 0)

    JSON.parse(options.params).forEach((value: unknown, i: number) => {
      const re = new RegExp(`\\$${i + 1}(?!\\d)`, 'g')
      const escaped = typeof value === 'string' ? `'${value.replace(/'/g, "\\'")}'` : value
      query = query.replace(re, String(escaped))
    })
    return query
  }

  static buildBulkInsert(datas: any[], table: string, pk: string = 'id'): Prisma.Sql {
    if (datas.length) {
      return Prisma.sql`INSERT INTO ${Prisma.raw(table)} (${Prisma.raw(Object.keys(datas[0]).join(','))}) VALUES ${Prisma.join(datas.map((i) => Prisma.sql`(${Prisma.join(Object.values(i))})`))} ON DUPLICATE KEY UPDATE ${Prisma.raw(
        Object.keys(datas[0])
          .filter((key) => key !== pk)
          .map((key) => `${key} = VALUES(${key})`)
          .join(','),
      )}`
    }
    return Prisma.sql`SELECT 1`
  }

  static buildLanguages<WhereInput = any>(
    jsonObject: Record<string, any>,
    options?: IPrismaLanguageBuildOptions<WhereInput>,
  ): any {
    const langField = options?.langField || 'language'
    const data = MESSAGE_LANGUAGES.map((language) => {
      const objValue = {}
      for (const jsonField in jsonObject) {
        objValue[langField] = language
        objValue[jsonField] = jsonObject[jsonField][language] || ''
      }
      return objValue
    })
    return {
      createMany: { data, skipDuplicates: true },
      deleteMany: options?.whereField,
    }
  }

  private static createAdapter(
    provider: ClientProvider,
    options: IPrismaAdapterCreateOptions,
  ): runtime.SqlDriverAdapterFactory {
    if (provider === 'postgresql') {
      return new PrismaPg(options.url)
    }

    if (provider === 'mysql') {
      return new PrismaMariaDb(options.url)
    }

    throw new Error(`Unsupported provider: ${provider}`)
  }

  private static createClient(
    provider: ClientProvider,
    options: { url: string; loggerHooks: IPrismaLoggerHooks },
  ): PrismaClient {
    const client = new PrismaClient({
      adapter: this.createAdapter(provider, { url: options.url }),
      log: options.loggerHooks.logLevels,
    })

    if (options.loggerHooks?.onError) client.$on('error', options.loggerHooks.onError)
    if (options.loggerHooks?.onQuery) client.$on('query', options.loggerHooks.onQuery)
    if (options.loggerHooks?.onWarn) client.$on('warn', options.loggerHooks.onWarn)
    if (options.loggerHooks?.onInfo) client.$on('info', options.loggerHooks.onInfo)

    return client
  }

  static setupClient(
    provider: ClientProvider,
    options: IPrismaClientCreateOptions,
  ): { writer: ClientWithExtends; readers: ClientWithExtends[] } {
    const writer = applyExtensions(
      this.createClient(provider, {
        url: options.writeUrl,
        loggerHooks: options.loggerHooks,
      }),
    )

    if (options.replication && options.readUrls.length) {
      const readers = []
      for (const url of options.readUrls) {
        const reader = applyExtensions(
          this.createClient(provider, {
            url: url,
            loggerHooks: options.loggerHooks,
          }),
        )
        readers.push(reader)
      }
      return { writer, readers }
    }
    return { writer, readers: [writer] }
  }
}
