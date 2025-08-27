import { ValidationError } from '@nestjs/common'
import { ArchiverOptions } from 'archiver'
import { ClassConstructor } from 'class-transformer'
import { ReadStream } from 'fs'
import { ENUM_FILE_TYPE_EXCEL } from '../enums'

export interface IFileRows<T = any> {
  data: T[]
  filters?: string[]
  headers?: string[]
  sheetName?: string
  metadata?: Record<string, T>
  serializer?: ClassConstructor<T>
}

export type IFileRange = {
  readstream: ReadStream
  contentLength: number
  contentRange?: string
}

export interface IFileReadOptions {
  password?: string
}

export interface IFileWriteExcelOptions {
  password?: string
  bookType?: ENUM_FILE_TYPE_EXCEL
  keepAlive?: boolean
}

export interface IFileWritePdfOptions {
  context?: any
  info?: {
    Producer?: string
    Creator?: string
    CreationDate?: Date
    Title?: string
    Author?: string
    Subject?: string
    Keywords?: string
  }
}

export interface IFileDataStructureOptions {
  serializer?: ClassConstructor<any>
  metadata?: Record<string, any>
}

export interface IFileCreateExcelWorkbookOptions {
  sheetName?: string
}

export interface IFileReadExcelOptions {
  sheet?: string | number
  password?: string
}

export interface IFile extends Omit<Express.Multer.File, 'filename'> {
  width?: number
  height?: number
  password?: string
}

export interface IFileUploadSingle {
  field: string
  filePath?: string
  fileSize?: number
  fileUser?: boolean
}

export interface IFileUploadMultiple extends IFileUploadSingle {
  maxFiles: number
}

export type IFileUploadMultipleField = Omit<IFileUploadMultiple, 'fileSize'>

export type IFileUploadMultipleFieldOptions = Omit<IFileUploadSingle, 'field'>

export interface IFileMessageError {
  message: string
  metadata: any
}

export interface IFileValidationImportErrorParam {
  sheetName: string
  row: number
  errors: ValidationError[]
}

export interface IFileImportErrors extends Pick<IFileRows, 'sheetName'> {
  row: number
  errors: IFileMessageError[]
}

export interface IFileValidationImportError extends Omit<IFileImportErrors, 'errors'> {
  errors: ValidationError[]
}

export interface IFileZipOptions extends ArchiverOptions {
  zipFilePath: string
  zipFileRelative?: string
}
