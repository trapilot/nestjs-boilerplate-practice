import { Prisma } from '@runtime/prisma-client'
import { MESSAGE_LANGUAGES } from 'lib/nest-core'

interface IBuildLanguageOptions<T> {
  langField?: string
  whereField?: T
}

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
    options?: IBuildLanguageOptions<WhereInput>,
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
}
