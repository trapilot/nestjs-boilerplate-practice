import { IRequestApp, IResponseApp } from 'lib/nest-core'

export interface ILoggerMetadata {
  [key: string]: any
}

export interface ILoggerData {
  correlationId?: string
  message?: string
  timestamp?: string
  context?: string
  level?: string
  pid?: number
  hostname?: string
  req?: IRequestApp
  res?: IResponseApp
  responseTime?: number
}

export interface ILoggerEntry {
  meta: ILoggerMetadata
  data: ILoggerData
}
