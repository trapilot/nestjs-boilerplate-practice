import { Inject, Injectable, Scope } from '@nestjs/common'
import pino from 'pino'
import { LOGGER_MODULE_OPTIONS } from '../constants'
import { LoggerFn, LoggerOptions } from '../interfaces'
import { LoggerHelper, storage } from '../utils'

let outOfContext: pino.Logger | undefined

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService
  implements Pick<pino.Logger, 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'>
{
  static readonly root: pino.Logger

  protected context = ''
  protected readonly contextName: string
  protected readonly errorKey: string = 'err'

  constructor(@Inject(LOGGER_MODULE_OPTIONS) { pinoHttp, renameContext }: LoggerOptions) {
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
      } else if (LoggerHelper.isPassedLogger(pinoHttp)) {
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

    this.contextName = renameContext || 'context'
  }

  get logger(): pino.Logger {
    // outOfContext is always set in runtime before starts using
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return storage.getStore()?.logger || outOfContext!
  }

  trace(msg: string, ...args: any[]): void
  trace(obj: unknown, msg?: string, ...args: any[]): void
  trace(...args: Parameters<LoggerFn>) {
    this.call('trace', ...args)
  }

  debug(msg: string, ...args: any[]): void
  debug(obj: unknown, msg?: string, ...args: any[]): void
  debug(...args: Parameters<LoggerFn>) {
    this.call('debug', ...args)
  }

  info(msg: string, ...args: any[]): void
  info(obj: unknown, msg?: string, ...args: any[]): void
  info(...args: Parameters<LoggerFn>) {
    this.call('info', ...args)
  }

  warn(msg: string, ...args: any[]): void
  warn(obj: unknown, msg?: string, ...args: any[]): void
  warn(...args: Parameters<LoggerFn>) {
    this.call('warn', ...args)
  }

  error(msg: string, ...args: any[]): void
  error(obj: unknown, msg?: string, ...args: any[]): void
  error(...args: Parameters<LoggerFn>) {
    this.call('error', ...args)
  }

  fatal(msg: string, ...args: any[]): void
  fatal(obj: unknown, msg?: string, ...args: any[]): void
  fatal(...args: Parameters<LoggerFn>) {
    this.call('fatal', ...args)
  }

  setContext(value: string) {
    this.context = value
  }

  assign(fields: pino.Bindings) {
    const store = storage.getStore()
    if (!store) {
      throw new Error(`${LoggerService.name}: unable to assign extra fields out of request scope`)
    }
    store.logger = store.logger.child(fields)
    store.responseLogger?.setBindings(fields)
  }

  protected call(method: pino.Level, ...args: Parameters<LoggerFn>) {
    if (this.context) {
      if (isFirstArgObject(args)) {
        const firstArg = args[0]
        if (firstArg instanceof Error) {
          args = [
            Object.assign({ [this.contextName]: this.context }, { [this.errorKey]: firstArg }),
            ...args.slice(1),
          ]
        } else {
          args = [Object.assign({ [this.contextName]: this.context }, firstArg), ...args.slice(1)]
        }
      } else {
        args = [{ [this.contextName]: this.context }, ...args]
      }
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore args are union of tuple types
    this.logger[method](...args)
  }
}

function isFirstArgObject(
  args: Parameters<LoggerFn>,
): args is [obj: object, msg?: string, ...args: any[]] {
  return typeof args[0] === 'object'
}
