import { HttpStatus } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { AuthJwtAccessPayloadDto } from 'lib/nest-auth'
import { IMessageProperties } from './message.interface'

export interface IRequestApp<T = AuthJwtAccessPayloadDto> extends Request {
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

export interface IRequestContext {
  apiType: string
  apiVersion: string
  language: string
  timezone: string
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

export interface IResponseMetadata {
  customProperty?: {
    statusCode?: number
    statusHttp?: HttpStatus
    message?: string
    messageProperties?: IMessageProperties
    serializeProperties?: Record<string, any>
  }
  [key: string]: any
}

export interface IResponseCacheOptions {
  key?: string
  ttl?: number // milliseconds
}

export interface IResponseException {
  message: string
  httpStatus: number
  statusCode?: number
  metadata?: IResponseMetadata
  errors?: IMessageError[]
  error?: string
}

export interface IMessageError {
  property: string
  message: string
}

export interface INextFunction extends NextFunction {}

export interface IContextPayload {
  tenantId: string
}

export interface IStep<T> {
  invoke(input: T): any
  compensate(input: T): any
}

export interface IClientData {
  userId: string
  userToken: string
  userDevice: string
  joinAt: number
  verifyAt: number
}

export interface IClientMessage {
  data: IClientData
  version?: string
}

export interface IClientIdentify {
  userId: string
  userToken: string
}

export interface IClientQuery {
  userId: string
  userDevice: string
  [key: string]: any
}
