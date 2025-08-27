import { Prisma, PrismaClient } from '@prisma/client'
import { ENUM_FILE_TYPE_EXCEL } from 'lib/nest-file'
import { withList, withPaginate, withReplica, withYield } from '../extensions'

export const _primaClient = new PrismaClient()

const pagingPrismaClient = _primaClient.$extends(withPaginate)
const listingPrismaClient = _primaClient.$extends(withList)
const yieldPrismaClient = _primaClient.$extends(withYield)
const replicaPrismaClient = _primaClient.$extends(withReplica)

export type PagingPrismaClient = typeof pagingPrismaClient
export type ListingPrismaClient = typeof listingPrismaClient
export type YieldPrismaClient = typeof yieldPrismaClient
export type ReplicaPrismaClient = typeof replicaPrismaClient

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
