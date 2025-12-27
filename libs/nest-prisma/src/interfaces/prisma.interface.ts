import { ENUM_FILE_TYPE_EXCEL } from 'lib/nest-core'
import { __clientWithExtends } from '../helpers'

export type ClientWithExtends = typeof __clientWithExtends

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
