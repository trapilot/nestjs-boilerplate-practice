import { PrismaClient } from '@prisma/client'
import { PrismaClient as PrismaClientExt } from '@prisma/client/extension'
import { ENUM_FILE_TYPE_EXCEL } from 'lib/nest-core'
import { withExtension } from '../extensions'

/* eslint-disable @typescript-eslint/no-unused-vars */
const __client = new PrismaClient()
const __clientWithExtension = __client.$extends(withExtension)
export type ClientWithExtension = typeof __clientWithExtension

export interface IPrismaReplicaOptions {
  replicas: PrismaClientExt[]
  defaultReadClient: 'primary' | 'replica'
}

export interface IPrismaReplicaParams {
  master: ClientWithExtension
  slave: ClientWithExtension
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
