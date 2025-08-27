import { Prisma } from '@prisma/client'
import { MESSAGE_LANGUAGES } from 'lib/nest-core'

export class PrismaHelper {
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

  static buildCreateLanguages(
    jsonObject: Record<string, any>,
    langField: string = 'language',
  ): any {
    const data = MESSAGE_LANGUAGES.map((language) => {
      const objValue = {}
      for (const jsonField in jsonObject) {
        objValue[langField] = language
        objValue[jsonField] = jsonObject[jsonField][language] || ''
      }
      return objValue
    })
    return { createMany: { data, skipDuplicates: true } }
  }

  static buildUpdateLanguages<Where = any>(
    jsonObject: Record<string, any>,
    where: Where,
    langField: string = 'language',
  ): any {
    const updateMany = MESSAGE_LANGUAGES.map((language) => {
      const objValue = {}
      const objWhere = Object.assign({}, where)
      for (const jsonField in jsonObject) {
        objWhere[langField] = language
        objValue[jsonField] = jsonObject[jsonField][language] || ''
      }
      return { where: objWhere, data: objValue }
    })
    // return { deleteMany: where, createMany: updateMany }
    return {
      deleteMany: where,
      createMany: PrismaHelper.buildCreateLanguages(jsonObject, langField).createMany,
    }
  }
}
