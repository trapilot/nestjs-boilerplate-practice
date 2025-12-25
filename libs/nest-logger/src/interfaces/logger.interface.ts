import { IRequestApp, IResponseApp } from 'lib/nest-core'
import { DestinationStream, Logger } from 'pino'
import { Options } from 'pino-http'

export type TLoggerFn =
  | ((msg: string, ...args: any[]) => void)
  | ((obj: object, msg?: string, ...args: any[]) => void)

export type TPassedLogger = {
  logger: Logger
}

export interface ILoggerDebugInfo {
  memory: {
    rss: number
    heapUsed: number
  }
  uptime: number
}

export interface ILoggerOptions {
  pinoHttp: Options | DestinationStream | [Options, DestinationStream]
  renameContext?: string
  assignResponse?: boolean
}

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
