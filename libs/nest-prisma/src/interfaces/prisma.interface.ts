import { Prisma } from '@runtime/prisma-client'
import { ENUM_FILE_BOOK_TYPE, IReturnIterator, IReturnList, IReturnPaging } from 'lib/nest-core'
import { applyExtensions } from '../extensions'

export type ClientWithExtends = ReturnType<typeof applyExtensions>

export type ClientProvider = 'postgresql' | 'mysql'

export interface IPrismaContext {
  tenantId?: string
  forcePrimary?: boolean
}

export interface IPrismaModuleOptions {
  replication: boolean
  multiTenant: boolean
}

export interface IPrismaClientConfigOptions {
  key?: string
  provider: ClientProvider
  master: string
  slaves?: string[]
  replication?: boolean
}

export interface IPrismaLoggerHooks {
  logLevels: Prisma.LogDefinition[]
  onQuery?: (event: Prisma.QueryEvent, metadata?: { manager: string; tenantId?: string }) => void
  onError?: (event: Prisma.LogEvent, metadata?: { manager: string; tenantId?: string }) => void
  onWarn?: (event: Prisma.LogEvent, metadata?: { manager: string; tenantId?: string }) => void
  onInfo?: (event: Prisma.LogEvent, metadata?: { manager: string; tenantId?: string }) => void
}

export interface IPrismaAdapterCreateOptions {
  url: string
}

export interface IPrismaClientCreateOptions {
  writeUrl: string
  readUrls: string[]
  replication: boolean
  loggerHooks: IPrismaLoggerHooks
}

export interface IPrismaLanguageBuildOptions<T> {
  langField?: string
  whereField?: T
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
  bookType?: ENUM_FILE_BOOK_TYPE
}

export interface IPrismaIterator {
  chunk?: number
  iterator?: boolean
}

export type IPrismaReturnList<T = Record<string, any>> = IReturnIterator<T> | IReturnList<T>
export type IPrismaReturnPaging<T = Record<string, any>> = IReturnIterator | IReturnPaging<T>
