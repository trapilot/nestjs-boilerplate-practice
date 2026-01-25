import {
  EnumFileExtensionDocument,
  IDatabaseProvider,
  IReturnGenerator,
  IReturnList,
  IReturnPaging,
} from 'lib/nest-core'

export interface IPrismaModuleOptions {
  replication: boolean
  multiTenant: boolean
  debug: boolean
}

export interface IPrismaClientOptions {
  provider: IDatabaseProvider
  writeUrl: string
  readUrls: string[]
  replication: boolean
  debugMode: boolean
}

export interface IPrismaAdapterCreateOptions {
  url: string
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
  document?: EnumFileExtensionDocument
}

export interface IPrismaGenerator {
  chunk?: number
  generator?: boolean
}

export type IPrismaReturnList<T = Record<string, any>> = IReturnGenerator<T> | IReturnList<T>
export type IPrismaReturnPaging<T = Record<string, any>> = IReturnGenerator | IReturnPaging<T>
