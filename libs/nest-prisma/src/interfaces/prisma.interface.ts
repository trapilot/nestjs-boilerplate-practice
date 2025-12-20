import { Prisma, PrismaClient } from '@prisma/client'
import { ENUM_FILE_TYPE_EXCEL } from 'lib/nest-core'
import { withList, withPaginate, withYield } from '../extensions'

/* eslint-disable @typescript-eslint/no-unused-vars */
const __client = new PrismaClient()
const __clientWithPaginate = __client.$extends(withPaginate).$extends(withYield)
const __clientWithList = __client.$extends(withList).$extends(withYield)
const __clientWithYield = __client.$extends(withYield)
export type ClientWithPaginate = typeof __clientWithPaginate
export type ClientWithList = typeof __clientWithList
export type ClientWithYield = typeof __clientWithYield
export type ExtendedPrismaClient = ClientWithPaginate & ClientWithList & ClientWithYield

export interface IPrismaContext {
  prisma?: Prisma.TransactionClient | null
}

export interface IPrismaParams {
  skip?: number
  take?: number
  cursor?: Record<string, number>
  orderBy?: Record<string, 'asc' | 'desc'>[]
  distinct?: any
}

export interface IPrismaOptions<T = any> {
  select?: T
  include?: T
  bookType?: ENUM_FILE_TYPE_EXCEL
}

export interface IPrismaIterator {
  chunk?: number
  iterator?: boolean
}
