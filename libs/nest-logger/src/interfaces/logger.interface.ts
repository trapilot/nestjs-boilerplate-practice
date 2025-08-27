import { IRequestApp, IResponseApp } from 'lib/nest-core'
import { DestinationStream, Logger } from 'pino'
import { Options } from 'pino-http'

export type LoggerFn =
  | ((msg: string, ...args: any[]) => void)
  | ((obj: object, msg?: string, ...args: any[]) => void)

export type PassedLogger = {
  logger: Logger
}

export interface LoggerOptions {
  /**
   * Optional parameters for `pino-http` module
   * @see https://github.com/pinojs/pino-http#pinohttpopts-stream
   */
  pinoHttp: Options | DestinationStream | [Options, DestinationStream]

  /**
   * Optional parameter to change property name `context` in resulted logs,
   * so logs will be like:
   * {"level":30, ... "RENAME_CONTEXT_VALUE_HERE":"AppController" }
   */
  renameContext?: string

  /**
   * Optional parameter to also assign the response logger during calls to
   * `PinoLogger.assign`. By default, `assign` does not impact response logs
   * (e.g.`Request completed`).
   */
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
