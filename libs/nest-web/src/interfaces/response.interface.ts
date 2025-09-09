import { HttpStatus } from '@nestjs/common'
import { ClassConstructor } from 'class-transformer'
import { ValidationError } from 'class-validator'
import { ENUM_FILE_MIME, IFileRows } from 'lib/nest-file'
import {
  IMessageOptionsProperties,
  IMessageValidationError,
  IMessageValidationImportError,
} from 'lib/nest-message'

export interface IResponseCustomPropertyMetadata {
  statusCode?: number
  statusHttp?: HttpStatus
  message?: string
  messageProperties?: IMessageOptionsProperties
  serializeProperties?: Record<string, any>
}

// metadata
export interface IResponseMetadata {
  customProperty?: IResponseCustomPropertyMetadata
  [key: string]: any
}

// decorator options

export interface IResponseOptions<T> {
  statusCode?: number
  statusHttp?: HttpStatus
  dto?: ClassConstructor<T>
  messageProperties?: IMessageOptionsProperties
  cached?: IResponseCacheOptions | boolean
  docExpansion?: boolean
}

export interface IResponseListOptions<T> extends Omit<IResponseOptions<T>, 'dto'> {
  dto: ClassConstructor<T>
}

export interface IResponsePagingOptions<T> extends IResponseListOptions<T> {
  dto: ClassConstructor<T>
}

export interface IResponseFileOptions<T> extends Omit<IResponseOptions<T>, 'dto'> {
  type: ENUM_FILE_MIME
  prefix?: string
  disposition?: 'attachment' | 'inline'
  password?: string
}

export interface IResponseFileExcelOptions<T> extends IResponseFileOptions<T> {
  serializer?: ClassConstructor<T>[]
  password?: string
}

// Response
export interface IResponseError {
  statusCode: number
  message: string
  metadata: IResponseMetadata
  errors?: IMessageValidationError[] | ValidationError[]
  error?: string
}

export interface IResponseBody<T = any> {
  success: boolean
  metadata: IResponseMetadata
  result?: T
  error?: {
    message: string
    code: string
    details?: IMessageValidationError[] | IMessageValidationImportError[]
    error?: string // Error message for debug
  }
}

// cached
export interface IResponseCacheOptions {
  key?: string
  ttl?: number // milliseconds
}

// Response
export interface IResponseData<T = Record<string, any>> {
  _metadata?: IResponseMetadata
  data: T
}

export interface IDataList<T = Record<string, any>> {
  _metadata?: IResponseMetadata
  data: T[]
}

export interface IDataPaging<T = Record<string, any>> extends IDataList<T> {
  pagination: {
    totalPage: number
    totalRecord: number
  }
}

export interface IDataIterator {
  _metadata?: IResponseMetadata
  data: AsyncGenerator<Record<string, any>[]>
  filePrefix?: string
  fileTimestamp?: boolean
}

export interface IDataFileBuffer {
  file: Buffer
  name: string
  timestamp?: boolean
}

export interface IDataFilePath {
  file: string | string[]
  name?: string
  relative?: string // use in zip file
  temporary?: boolean
}

export type IResponseList = IDataList | IDataIterator
export type IResponsePaging = IDataPaging | IDataIterator
export type IResponseFile = IDataFileBuffer | IDataFilePath

export interface IResponseFileExcel {
  data: IFileRows[]
}

export interface IResponsePushgateway {
  status: number
  success: boolean
  message?: string
}
