import { HttpException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DateUtil, EnumAppEnvironment, IRequestApp } from 'lib/nest-core'
import pino, { LevelWithSilent, Logger } from 'pino'
import { HttpLogger, Options, pinoHttp } from 'pino-http'
import {
  LOGGER_CONTEXT_KEY,
  LOGGER_ERROR_KEY,
  LOGGER_EXCLUDED_ROUTES,
  LOGGER_MESSAGE_KEY,
  LOGGER_REQUEST_ID_HEADERS,
  LOGGER_SENSITIVE_FIELDS,
  LOGGER_SENSITIVE_PATHS,
} from '../constants'
import { LoggerFileDriver, LoggerRemoteDriver } from '../drivers'
import { EnumLoggerSeverity } from '../enums'
import { ILoggerDebugInfo, ILoggerFileConfig } from '../interfaces'
import { AppUtil, LoggerUtil } from '../utils'

@Injectable()
export class LoggerFactory {
  private readonly env: EnumAppEnvironment
  private readonly name: string
  private readonly version: string

  private readonly sensitiveFields: Set<string>
  private readonly sensitivePaths: string[]

  private readonly level: LevelWithSilent
  private readonly driver: 'file' | 'remote'

  constructor(private readonly config: ConfigService) {
    this.env = this.config.get<EnumAppEnvironment>('app.env')
    this.name = this.config.get<string>('app.name')
    this.version = this.config.get<string>('app.version')

    this.level = this.config.get<LevelWithSilent>('logger.level')
    this.driver = this.config.get<'file' | 'remote'>('logger.driver')

    this.sensitiveFields = new Set(LOGGER_SENSITIVE_FIELDS.map(field => field.toLowerCase()))
    this.sensitivePaths = LOGGER_SENSITIVE_PATHS.map(path =>
      LOGGER_SENSITIVE_FIELDS.map(field =>
        field.includes('-') ? `${path}["${field}"]` : `${path}.${field}`
      )
    ).flat()
  }

  createHttpPino(name?: string): HttpLogger {
    const pinoOptions = this.createPinoOptions(name)
    return pinoHttp({
      ...pinoOptions,
      wrapSerializers: false,
      genReqId: this.getReqId,
      stream: this.createStream(),
      autoLogging: this.createAutoLoggingConfig(),
    })
  }

  createPino(name?: string): Logger {
    const pinoOptions = this.createPinoOptions(name)
    return pino(pinoOptions, this.createStream())
  }

  private createPinoOptions(name?: string): pino.LoggerOptions {
    return {
      name,
      errorKey: LOGGER_ERROR_KEY,
      messageKey: LOGGER_MESSAGE_KEY,
      timestamp: false,
      base: null,
      level: this.level || 'silent',
      formatters: {
        log: this.createLogFormatter(),
      },
      mixin: this.createMixin(),
      transport: this.buildTransports(),
      redact: this.createRedactionConfig(),
      serializers: this.createSerializers(),
    }
  }

  private getReqId(request: IRequestApp): string {
    const headers = request.headers
    if (!headers) {
      return LoggerUtil.genReqId()
    }

    for (const header of LOGGER_REQUEST_ID_HEADERS) {
      const value = headers[header]
      if (value) {
        return value as string
      }
    }

    return request.id as string
  }

  private sanitizeMessage(message: unknown): string | unknown {
    if (typeof message === 'string') {
      return message
        .replaceAll(/[~→]/g, '')
        .replaceAll(/^\s*\d+\s+/gm, '')
        .replaceAll(/\s+/g, ' ')
        .trim()
    }

    return message
  }

  private createLogFormatter(): (obj: Record<string, unknown>) => Record<string, unknown> {
    return (obj: Record<string, any>) => {
      const pid = process.pid
      const hostname = AppUtil.getHostname()
      const today = DateUtil.getNow()

      const {
        time: _time, // ignored
        responseTime: _responseTime, // ignored
        timestamp,
        level,
        req,
        res,
        err,
        error,
        [LOGGER_CONTEXT_KEY]: _context,
        [LOGGER_MESSAGE_KEY]: _message,
        ...additionalData
      } = obj

      const severity = this.mapLevelToSeverity(level as number)

      return {
        severity,
        timestamp: timestamp ? Date.parse(timestamp) : today.valueOf(),
        [LOGGER_MESSAGE_KEY]: this.sanitizeMessage(_message),
        [LOGGER_CONTEXT_KEY]: _context ?? LoggerUtil.getContextOrDefault(),
        service: {
          name: this.name,
          environment: this.env,
          version: this.version,
        },
        ...(Object.keys(additionalData).length > 0 && {
          additionalData: this.sanitizeObject(additionalData),
        }),
        ...(this.env !== EnumAppEnvironment.PRODUCTION && {
          debug: this.addDebugInfo({ pid, hostname }),
        }),
        ...(err && {
          err: this.createErrorSerializer()((error as Error) ?? (err as Error)),
        }),
        ...(res && {
          res,
        }),
        ...(req && {
          req,
        }),
      }
    }
  }

  private createStream() {
    return this.driver == 'remote'
      ? new LoggerRemoteDriver(this.config.getOrThrow<string>('logger.remote.url'))
      : new LoggerFileDriver(this.config.getOrThrow<ILoggerFileConfig>('logger.file'))
  }

  private createRedactionConfig(): {
    paths: string[]
    censor: string
    remove: boolean
  } {
    return {
      paths: this.sensitivePaths,
      censor: '[REDACTED]',
      remove: false,
    }
  }

  private createSerializers(): {
    req: (request: IRequestApp) => Record<string, unknown>
  } {
    return {
      req: this.createRequestSerializer(),
    }
  }

  private sanitizeObject(obj: unknown, maxDepth: number = 5, currentDepth: number = 0): unknown {
    if (
      !obj ||
      typeof obj !== 'object' ||
      obj instanceof Date ||
      obj instanceof RegExp ||
      currentDepth >= maxDepth
    ) {
      return obj
    }

    if (obj instanceof Buffer) {
      return { buffer: '[BUFFER]' }
    }

    if (Array.isArray(obj)) {
      if (obj.length > 10) {
        const newObj = obj
          .slice(0, 10)
          .map(item => this.sanitizeObject(item, maxDepth, currentDepth + 1))

        newObj.push({
          truncated: `...[TRUNCATED] - total length ${obj.length}`,
        })

        return newObj
      }
      return obj.map(item => this.sanitizeObject(item, maxDepth, currentDepth + 1))
    }

    const result = { ...obj }

    for (const key in result) {
      if (this.sensitiveFields.has(key.toLowerCase())) {
        result[key] = `[REDACTED]`
      } else if (typeof result[key] === 'object') {
        result[key] = this.sanitizeObject(result[key], maxDepth, currentDepth + 1)
      }
    }

    return result
  }

  private extractClientIP(request: IRequestApp): string {
    if (request.ip) {
      return request.ip as string
    }

    if (request.socket?.remoteAddress) {
      return request.socket.remoteAddress as string
    }

    const headers = request.headers
    if (headers) {
      const forwarded = headers['x-forwarded-for'] as string
      if (forwarded) {
        const firstIP = forwarded.split(',')[0].trim()
        if (firstIP) {
          return firstIP
        }
      }

      const realIP = headers['x-real-ip'] as string
      if (realIP) {
        return realIP
      }
    }

    return 'unknown'
  }

  private serializeUser(request: IRequestApp): string | null {
    return (request.user as unknown as { userId: string })?.userId ?? null
  }

  private addDebugInfo(additionalParams: Record<string, unknown>): ILoggerDebugInfo | undefined {
    const memUsage = process.memoryUsage()
    return {
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      },
      uptime: Math.round(process.uptime()),
      ...additionalParams,
    }
  }

  private createRequestSerializer(): (request: IRequestApp) => Record<string, unknown> {
    return (request: IRequestApp) => {
      return {
        id: request.id,
        method: request.method,
        url: request.url,
        path: request.path,
        route: request.route?.path,
        query: this.sanitizeObject(request.query),
        params: this.sanitizeObject(request.params),
        headers: this.sanitizeObject(request.headers),
        ip: this.extractClientIP(request),
        user: this.serializeUser(request),
        userAgent: request.headers['user-agent'],
        contentType: request.headers?.['content-type'],
        referer: request.headers.referer,
        remoteAddress: (request as unknown as { remoteAddress: string }).remoteAddress,
        remotePort: (request as unknown as { remotePort: number }).remotePort,
      }
    }
  }

  private createErrorSerializer(): (error: Error) => Record<string, unknown> {
    return (error: Error) => {
      const defaultError = {
        type: error.name,
        message: this.sanitizeMessage(error.message),
        code: (error as unknown as { status?: number })?.status,
        statusCode: (error as unknown as { response?: { statusCode?: number } })?.response
          ?.statusCode,
        stack: error.stack,
      }

      if (error instanceof HttpException) {
        const response = error.getResponse() as { _error?: unknown }
        return {
          ...defaultError,
          stack: response._error ? String(response._error) : defaultError.stack,
        }
      }

      return defaultError
    }
  }

  private createAutoLoggingConfig(): { ignore: (req: IRequestApp) => boolean } | boolean {
    return {
      ignore: (req: IRequestApp) => this.checkUrlMatchesPatterns(req.url, LOGGER_EXCLUDED_ROUTES),
    }
  }

  private checkUrlMatchesPatterns(url: string, patterns: string[]): boolean {
    if (!url || !patterns?.length) {
      return false
    }

    let pathname: string
    try {
      const urlObj = new URL(url)
      pathname = urlObj.pathname
    } catch {
      pathname = url.split('?')[0].split('#')[0]
    }

    const normalizedPath = pathname.toLowerCase()

    return patterns.some(pattern => {
      if (!pattern) {
        return false
      }

      const normalizedPattern = pattern.toLowerCase()

      if (normalizedPath === normalizedPattern) {
        return true
      }

      if (!pattern.includes('*')) {
        return false
      }

      try {
        if (normalizedPattern === '*') {
          return true
        }

        if (normalizedPattern.endsWith('*')) {
          const basePattern = normalizedPattern.slice(0, -1)

          if (!basePattern) {
            return true
          }

          if (basePattern.endsWith('/')) {
            return normalizedPath.startsWith(basePattern)
          }

          return normalizedPath === basePattern || normalizedPath.startsWith(basePattern + '/')
        }

        const regexPattern = normalizedPattern
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*')

        const regex = new RegExp(`^${regexPattern}$`)
        return regex.test(normalizedPath)
      } catch {
        return false
      }
    })
  }

  private mapLevelToSeverity(level: number): string {
    if (level >= 60) {
      return EnumLoggerSeverity.CRITICAL.toUpperCase()
    } else if (level >= 50) {
      return EnumLoggerSeverity.ERROR.toUpperCase()
    } else if (level >= 40) {
      return EnumLoggerSeverity.WARNING.toUpperCase()
    } else if (level >= 30) {
      return EnumLoggerSeverity.INFO.toUpperCase()
    } else if (level >= 20) {
      return EnumLoggerSeverity.DEBUG.toUpperCase()
    }

    return EnumLoggerSeverity.TRACE.toUpperCase()
  }

  private createMixin(): (_: Record<string, unknown>, level: number) => Record<string, unknown> {
    return (_: Record<string, unknown>, level: number) => {
      const context = LoggerUtil.getScopeContext()
      return {
        level: level,
        ...(context && {
          [LOGGER_CONTEXT_KEY]: context,
        }),
      }
    }
  }

  private buildTransports(): Options['transport'] {
    const transport = {
      targets: [],
    }

    return transport.targets.length > 0 ? transport : undefined
  }
}
