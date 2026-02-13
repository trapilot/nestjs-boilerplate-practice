import { ValidationError } from '@nestjs/common'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validate, ValidatorOptions } from 'class-validator'
import { EnumAuthLoginFrom } from 'lib/nest-auth'
import ms from 'ms'
import { hostname } from 'os'
import { APP_ENV, APP_LANGUAGE_LIST, APP_URL } from '../constants'
import { ScopeContext } from '../contexts'
import { EnumAppEnvironment, EnumRoutePath, EnumRouteType } from '../enums'
import { IAppRule, IMessageAttributes, IMessageField, IMessageRow } from '../interfaces'
import { FileUtil } from './file.util'

export class AppUtil {
  static isEnv(env: EnumAppEnvironment): boolean {
    return env === APP_ENV
  }

  static isLocal(): boolean {
    return this.isEnv(EnumAppEnvironment.DEVELOPMENT)
  }

  static isDebug(): boolean {
    return !this.isLive()
  }

  static isLive(): boolean {
    return this.isEnv(EnumAppEnvironment.PRODUCTION)
  }

  static sleep(value: ms.StringValue): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms(value)))
  }

  static ms(value: ms.StringValue): number {
    return ms(value)
  }

  static seconds(value: ms.StringValue): number {
    return Math.floor(ms(value) / 1000)
  }

  static captureException(exception: any, isConsole: boolean = false): void {
    if (isConsole || this.isLocal()) {
      console.error(exception)
    }
  }

  static catchMessage(err: unknown, errAs: string = 'Unknown error'): string {
    return err instanceof Error ? err.message : errAs
  }

  static getHostname(): string {
    return hostname()
  }

  static getLoginFrom(url: string): EnumAuthLoginFrom {
    if (url.includes(EnumRoutePath.CMS)) {
      return EnumAuthLoginFrom.CMS
    } else if (url.includes(EnumRoutePath.APP)) {
      return EnumAuthLoginFrom.APP
    } else if (url.includes(EnumRoutePath.WEB)) {
      return EnumAuthLoginFrom.WEB
    }
    return null
  }

  static getBaseUrl(): string {
    if (AppUtil.isLocal() && ScopeContext.isReqRoute(EnumRouteType.APP)) {
      return `http://10.0.2.2:3000`
    }
    return process.env.APP_URL || APP_URL
  }

  static buildMessageField<T>(
    jsonRows: IMessageRow<T>[],
    options: {
      fieldName: string
      fieldLang: string
      fallbackValue: T
    },
  ): IMessageField<string> {
    const jsonField = APP_LANGUAGE_LIST.reduce((localizedField, language) => {
      const jsonRow = jsonRows.find(jsonRow => jsonRow[options.fieldLang] === language)
      localizedField[language] = jsonRow?.[options.fieldName] ?? options.fallbackValue
      return localizedField
    }, {})
    return jsonField
  }

  static getMessageValue<T>(
    field: IMessageField<T>,
    options: { language: string; fallbackValue: T },
  ): T {
    if (field) {
      return field[options.language] ?? options.fallbackValue
    }
    return options.fallbackValue
  }

  static parseMessageRows<T>(
    attributes: IMessageAttributes<T>,
    options: {
      fieldLang: string
      fallbackValue: T
    },
  ): IMessageRow<string>[] {
    const jsonRows = APP_LANGUAGE_LIST.map(language => {
      const jsonRow = {}
      for (const attribute in attributes) {
        jsonRow[attribute] = attributes[attribute][language] || options.fallbackValue
        jsonRow[options.fieldLang] = language
      }
      return jsonRow
    })
    return jsonRows
  }

  static buildUrl(path: string, host?: string): string {
    if (!path) return path

    host = host || this.getBaseUrl()
    path = FileUtil.normalize(path)

    return `${host}/${path}`
  }

  static async validateDto(
    dto: ClassConstructor<any>,
    object: object,
    options?: ValidatorOptions,
  ): Promise<ValidationError[]> {
    const classDto = plainToInstance(dto, object)
    return await validate(classDto, options)
  }

  static initializeRuler<T>(rules: IAppRule<T>[] = []) {
    return new AppRuler<T>(rules)
  }
}

class AppRuler<T> {
  private rules: IAppRule<T>[] = []

  constructor(rules: IAppRule<T>[] = []) {
    this.rules = rules
  }

  addRule(rule: IAppRule<T>): void {
    this.rules.push(rule)
  }

  async validate(data: T): Promise<void> {
    for (const rule of this.rules) {
      await rule.validate(data)
    }
  }
}
