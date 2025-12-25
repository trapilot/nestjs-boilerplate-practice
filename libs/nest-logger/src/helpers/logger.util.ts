import { INextFunction, IRequestApp, IResponseApp } from 'lib/nest-core'
import { pinoHttp } from 'pino-http'
import { v7 as uuidv7 } from 'uuid'
import { ENUM_LOGGER_TYPE } from '../enums'
import { ILoggerEntry, ILoggerOptions, TPassedLogger } from '../interfaces'
import { LoggerService } from '../services'

export class LoggerUtil {
  static genReqId(): string {
    return uuidv7()
  }

  static createEntry(logStr: string, _encoding: string): ILoggerEntry {
    const logChunk = JSON.parse(logStr)
    const { prefix } = logChunk

    let message = logChunk.msg || logChunk.message
    let correlationId = logChunk['x-correlation-id'] || null
    message = logChunk.level >= 50 && logChunk.stack ? `${message}\n${logChunk.stack}` : message
    message = prefix ? `[${prefix}] ${message}` : message

    const data = {
      correlationId,
      message,
      timestamp: new Date().toISOString(),
      context: ENUM_LOGGER_TYPE.SYSTEM,
      ...logChunk,
    }
    if (data.msg) {
      delete data.msg
    }
    if (data.labels) {
      delete data.labels
    }
    if ('x-correlation-id' in data) {
      delete data['x-correlation-id']
    }

    const entry = {
      meta: {},
      data,
    }
    return entry
  }

  static isPassedLogger(pinoHttpProp: any): pinoHttpProp is TPassedLogger {
    return !!pinoHttpProp && 'logger' in pinoHttpProp
  }

  static createMiddlewares(
    options: NonNullable<ILoggerOptions['pinoHttp']>,
    assignResponse = false,
  ) {
    const middleware = pinoHttp(...(Array.isArray(options) ? options : [options as any]))

    // @ts-expect-error: root is readonly field, but this is the place where
    // it's set actually
    LoggerService.root = middleware.logger

    // FIXME: params type here is pinoHttp.Options | pino.DestinationStream
    // pinoHttp has two overloads, each of them takes those types
    return [middleware, LoggerUtil.bindMiddlewareFactory(assignResponse)]
  }

  static bindMiddlewareFactory(assignResponse: boolean) {
    return function bind(req: IRequestApp, res: IResponseApp, next: INextFunction) {
      let log = req.log
      let resLog = assignResponse ? res.log : undefined

      if (req.allLogs) {
        log = req.allLogs[req.allLogs.length - 1]!
      }
      if (assignResponse && res.allLogs) {
        resLog = res.allLogs[res.allLogs.length - 1]!
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: run requires arguments for next but should not because it can
      // be called without arguments
      storage.run(new LoggerStore(log, resLog), next)
    }
  }
}
