import { HttpStatus } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { IAuthJwtPayload } from 'lib/nest-auth'
import { IMessageProperties } from './message.interface'

export interface IRequestApp<T = IAuthJwtPayload> extends Request {
  user?: T

  __timezone: string
  __language: string
  __version: string

  __filters?: {
    search?: string
    orderBy?: string
    availableSearch?: string[]
    availableOrderBy?: string[]
    [key: string]: any
  }

  __pagination?: {
    page: number
    perPage: number
  }

  raw?: any
  rawBody?: any // custom raw body
}

export interface IRequestFile<F = Record<string, any>> extends IRequestApp {
  fileInfo: F
}

export interface IResponseApp extends Response {
  body?: any
  headers?: any
  responseTime?: number

  send(body: any): any
}

export type INextFunction = NextFunction

export interface IReturnMetadata {
  statusCode?: number
  httpStatus?: HttpStatus
  messagePath?: string
  messageProperties?: IMessageProperties
  mappingProperties?: Record<string, any> // propterties which map with object keys
}

export interface IReturnData<T = Record<string, any>> {
  metadata?: IReturnMetadata
  data: T
}

export interface IReturnList<T = Record<string, any>> {
  metadata?: IReturnMetadata
  data: T[]
}

export interface IReturnPaging<T = Record<string, any>> {
  metadata?: IReturnMetadata
  data: T[]
  pagination: {
    totalPage: number
    totalRecord: number
  }
}

export interface IReturnGenerator<T = Record<string, any>> {
  metadata?: IReturnMetadata
  data: AsyncGenerator<T[]>
  filePrefix?: string
  fileTimestamp?: boolean
}

export interface IReturnBuffer {
  file: Buffer
  name: string
  timestamp?: boolean
}

export interface IReturnPath {
  file: string | string[]
  name?: string
  relative?: string // use in zip file
  temporary?: boolean
}
