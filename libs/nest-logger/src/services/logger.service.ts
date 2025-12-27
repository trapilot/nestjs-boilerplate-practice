import { Inject, Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common'
import pino from 'pino'
import { LOGGER_CONTEXT_KEY, LOGGER_MODULE_OPTIONS } from '../constants'
import { LoggerContext } from '../helpers'
import { ILoggerOptions, TLoggerFn } from '../interfaces'
import { LoggerUtil } from '../utils'

let outOfContext: pino.Logger | undefined

const isFirstArgObject = (
  args: Parameters<TLoggerFn>,
): args is [obj: object, msg?: string, ...args: any[]] => {
  return typeof args[0] === 'object'
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  static readonly root: pino.Logger

  protected contextValue = ''
  protected readonly contextKey: string
  protected readonly errorKey: string = 'err'

  constructor(@Inject(LOGGER_MODULE_OPTIONS) { pinoHttp, renameContext }: ILoggerOptions) {
    if (
      typeof pinoHttp === 'object' &&
      'customAttributeKeys' in pinoHttp &&
      typeof pinoHttp.customAttributeKeys !== 'undefined'
    ) {
      this.errorKey = pinoHttp.customAttributeKeys.err ?? 'err'
    }

    if (!outOfContext) {
      if (Array.isArray(pinoHttp)) {
        outOfContext = pino(...pinoHttp)
      } else if (LoggerUtil.isPassedLogger(pinoHttp)) {
        outOfContext = pinoHttp.logger
      } else if (
        typeof pinoHttp === 'object' &&
        'stream' in pinoHttp &&
        typeof pinoHttp.stream !== 'undefined'
      ) {
        outOfContext = pino(pinoHttp, pinoHttp.stream)
      } else {
        outOfContext = pino(pinoHttp)
      }
    }

    this.contextKey = renameContext || LOGGER_CONTEXT_KEY
  }

  get logger(): pino.Logger {
    // outOfContext is always set in runtime before starts using
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return LoggerContext.getStore()?.logger || outOfContext!
  }

  trace(msg: string, ...args: any[]): void
  trace(obj: unknown, msg?: string, ...args: any[]): void
  trace(...args: Parameters<TLoggerFn>) {
    this.call('trace', ...args)
  }

  debug(msg: string, ...args: any[]): void
  debug(obj: unknown, msg?: string, ...args: any[]): void
  debug(...args: Parameters<TLoggerFn>) {
    this.call('debug', ...args)
  }

  info(msg: string, ...args: any[]): void
  info(obj: unknown, msg?: string, ...args: any[]): void
  info(...args: Parameters<TLoggerFn>) {
    this.call('info', ...args)
  }

  log(msg: string, ...args: any[]): void
  log(obj: unknown, msg?: string, ...args: any[]): void
  log(...args: Parameters<TLoggerFn>) {
    this.call('info', ...args)
  }

  warn(msg: string, ...args: any[]): void
  warn(obj: unknown, msg?: string, ...args: any[]): void
  warn(...args: Parameters<TLoggerFn>) {
    this.call('warn', ...args)
  }

  error(msg: string, ...args: any[]): void
  error(obj: unknown, msg?: string, ...args: any[]): void
  error(...args: Parameters<TLoggerFn>) {
    this.call('error', ...args)
  }

  fatal(msg: string, ...args: any[]): void
  fatal(obj: unknown, msg?: string, ...args: any[]): void
  fatal(...args: Parameters<TLoggerFn>) {
    this.call('fatal', ...args)
  }

  setContext(value: string) {
    this.contextValue = value.toLowerCase()
  }

  assign(fields: pino.Bindings) {
    const store = LoggerContext.getStore()
    if (!store) {
      throw new Error(`${LoggerService.name}: unable to assign extra fields out of request scope`)
    }
    store.logger = store.logger.child(fields)
    store.responseLogger?.setBindings(fields)
  }

  protected call(method: pino.Level, ...args: Parameters<TLoggerFn>) {
    if (this.contextValue) {
      if (isFirstArgObject(args)) {
        const firstArg = args[0]
        if (firstArg instanceof Error) {
          args = [
            Object.assign({ [this.contextKey]: this.contextValue }, { [this.errorKey]: firstArg }),
            ...args.slice(1),
          ]
        } else {
          args = [
            Object.assign({ [this.contextKey]: this.contextValue }, firstArg),
            ...args.slice(1),
          ]
        }
      } else {
        args = [{ [this.contextKey]: this.contextValue }, ...args]
      }
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore args are union of tuple types
    this.logger[method](...args)
  }
}
