import { HttpStatus, NestInterceptor, Type } from '@nestjs/common'
import { ClassConstructor } from 'class-transformer'
import { ENUM_FILE_DISPOSITION, ENUM_FILE_MIME, IFileRows, IResponseMetadata } from 'lib/nest-core'

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

export type IResponseList = IDataIterator | IDataList
export type IResponsePaging = IDataIterator | IDataPaging
export type IResponseFile = IDataFileBuffer | IDataFilePath

export interface IResponseFileExcel {
  data: IFileRows[]
}

export interface IResponsePushgateway {
  status: number
  success: boolean
  message?: string
}
