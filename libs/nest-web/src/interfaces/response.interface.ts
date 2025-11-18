import { HttpStatus } from '@nestjs/common'
import { ClassConstructor } from 'class-transformer'
import {
  ENUM_FILE_MIME,
  IFileRows,
  IMessageError,
  IMessageProperties,
  IResponseCacheOptions,
  IResponseMetadata,
} from 'lib/nest-core'

export interface IResponseOptions<T> {
  statusCode?: number
  statusHttp?: HttpStatus
  dto?: ClassConstructor<T>
  messageProperties?: IMessageProperties
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
export interface IResponseSuccess<T = any> {
  success: boolean
  metadata: IResponseMetadata
  result: T
}

export interface IResponseFailure<T = any> extends Omit<IResponseSuccess<T>, 'result'> {
  error: {
    message: string
    code: string | number
    details?: IMessageError[]
    error?: string // Error message for debugging
  }
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
