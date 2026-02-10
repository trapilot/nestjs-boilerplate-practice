import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaPg } from '@prisma/adapter-pg'
import * as runtime from '@prisma/client/runtime/client'
import { Prisma } from '@runtime/prisma-client'
import { AppUtil, IDatabaseProvider, IMessageAttributes } from 'lib/nest-core'
import { IPrismaAdapterCreateOptions, IPrismaLanguageBuildOptions } from '../interfaces'

export class PrismaUtil {
  static toAlias<T, N>(data: T): N {
    return structuredClone(data as unknown) as N
  }

  static toPlainObject<T, N = Prisma.JsonObject>(data: T): N {
    return structuredClone(data as unknown) as N
  }

  static toPlainArray<T, N = Prisma.JsonObject>(data: T): N[] {
    return structuredClone(data) as N[]
  }

  static buildQuery(rawQuery: string, options: { params: string }): string {
    let index = 0
    let query = rawQuery
      .split('?')
      .map(s => `$${index++}${s}`)
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
      return Prisma.sql`INSERT INTO ${Prisma.raw(table)} (${Prisma.raw(Object.keys(datas[0]).join(','))}) VALUES ${Prisma.join(datas.map(i => Prisma.sql`(${Prisma.join(Object.values(i))})`))} ON DUPLICATE KEY UPDATE ${Prisma.raw(
        Object.keys(datas[0])
          .filter(key => key !== pk)
          .map(key => `${key} = VALUES(${key})`)
          .join(','),
      )}`
    }
    return Prisma.sql`SELECT 1`
  }

  static buildLanguages<WhereInput = any>(
    attributes: IMessageAttributes<string>,
    options?: IPrismaLanguageBuildOptions<WhereInput>,
  ): any {
    const data = AppUtil.parseMessageRows(attributes, {
      fieldLang: options?.langField || 'language',
      fallbackValue: '',
    })

    return {
      createMany: { data, skipDuplicates: true },
      deleteMany: options?.whereField,
    }
  }

  static createAdapter(
    provider: IDatabaseProvider,
    options: IPrismaAdapterCreateOptions,
  ): runtime.SqlDriverAdapterFactory {
    if (provider === 'postgres') {
      return new PrismaPg(options.url)
    }

    if (provider === 'mysql' || provider === 'mariadb') {
      return new PrismaMariaDb(options.url)
    }

    throw new Error(`Unsupported provider: ${provider}`)
  }

  static isUniqueError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
  }
  static isNoRequiredRecord(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
  }

  static isTimeoutError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034'
  }

  static isDeadlockError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034'
  }
}
