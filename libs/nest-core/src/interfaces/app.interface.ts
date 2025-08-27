import { CacheModuleOptions } from '@nestjs/cache-manager'
import { ConfigModuleOptions } from '@nestjs/config'
import { EventEmitterModuleOptions } from '@nestjs/event-emitter/dist/interfaces'
import { NextFunction, Request, Response } from 'express'
import { AuthJwtAccessPayloadDto } from 'lib/nest-auth'

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
  rawBody?: any // customer raw body
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

export interface INextFunction extends NextFunction {}

export interface IContextPayload {
  tenantId: string
}

export interface IStep<T> {
  invoke(input: T): any
  compensate(input: T): any
}

export interface ISocketMessage {
  data: any
  version?: string
  token?: string
}

export interface ISocketBulkMessage extends Omit<ISocketMessage, 'token'> {}

export interface IAppModuleOptions {
  config: ConfigModuleOptions
  cache: CacheModuleOptions
  emitter: EventEmitterModuleOptions
}
