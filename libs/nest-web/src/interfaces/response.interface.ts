import { HttpStatus, NestInterceptor, Type } from '@nestjs/common'
import { ClassConstructor } from 'class-transformer'
import {
  ENUM_FILE_DISPOSITION,
  ENUM_FILE_MIME,
  IMessageError,
  IReturnBuffer,
  IReturnData,
  IReturnIterator,
  IReturnList,
  IReturnMetadata,
  IReturnPaging,
  IReturnPath,
} from 'lib/nest-core'

export interface IResponseOptions {
  statusCode?: HttpStatus
  dto?: ClassConstructor<any>
  cached?: { key: string; ttl: number } | boolean
}

export interface IResponseDataOptions extends IResponseOptions {
  data: {
    type: ClassConstructor<any>
    interceptor: Type<NestInterceptor>
  }
}

export interface IResponseListOptions extends IResponseOptions {
  exportable: boolean
  exportFile?: {
    prefix?: string
    password?: string
  }
  data: {
    list: boolean
    type: ClassConstructor<any>
    interceptor: Type<NestInterceptor>
  }
}

export interface IResponseFileOptions extends Omit<IResponseOptions, 'serializer' | 'cached'> {
  disposition: ENUM_FILE_DISPOSITION
  type?: ENUM_FILE_MIME
  file: {
    interceptor?: Type<NestInterceptor>
  }
}

export interface IResponseMetrics {
  status: number
  success: boolean
  message?: string
}

export interface IResponseException {
  message: string
  httpStatus: number
  statusCode?: number
  metadata?: IReturnMetadata
  errors?: IMessageError[]
  error?: string
}

export type IResponseData<T = Record<string, any>> = IReturnData<T>
export type IResponseList<T = Record<string, any>> = IReturnIterator<T> | IReturnList<T>
export type IResponsePaging<T = Record<string, any>> = IReturnIterator | IReturnPaging<T>
export type IResponseFile = IReturnBuffer | IReturnPath
