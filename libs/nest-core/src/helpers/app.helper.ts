import { join } from 'path'
import { APP_ENV, APP_PATH, APP_URL, MESSAGE_FALLBACK, MESSAGE_LANGUAGES } from '../constants'
import { AppContext } from '../contexts'
import {
  ENUM_APP_API_ROUTE,
  ENUM_APP_API_TYPE,
  ENUM_APP_ENVIRONMENT,
  ENUM_CURRENCY_LANGUAGE,
  ENUM_MESSAGE_LANGUAGE,
  ENUM_NUMBER_LANGUAGE,
} from '../enums'
import {
  IDateExtractData,
  IDateRequestOptions,
  IStringCurrencyOptions,
  IStringNumericOptions,
  IStringParseOptions,
} from '../interfaces'
import { HelperDateService } from '../services'
import { TimeHelper } from './time.helper'

export class AppHelper {
  static sleep(msValue: string | number) {
    return new Promise((r) => setTimeout(r, TimeHelper.ms(`${msValue}`)))
  }

  static parse<T = any>(value: string, options: IStringParseOptions): T {
    let finalValue: any = value
    const defValue: any = options?.errorAs

    if (value === undefined) {
      return defValue
    }

    switch (options?.parseAs) {
      case 'id':
        finalValue = parseInt(value, 10) || undefined
        break
      case 'number':
        finalValue = parseInt(value, 10)
        break
      case 'boolean':
        finalValue = value === 'true' || finalValue === true
        break
      case 'string':
        finalValue = String(value).trim()
        break
      case 'datetime':
        finalValue = new Date(value)
        break
    }
    return finalValue as T
  }

  static isEnv(env: ENUM_APP_ENVIRONMENT): boolean {
    return env === (process.env.APP_ENV || APP_ENV)
  }

  static isDevelopment(): boolean {
    return this.isEnv(ENUM_APP_ENVIRONMENT.DEVELOPMENT)
  }

  static isProduction(): boolean {
    return this.isEnv(ENUM_APP_ENVIRONMENT.PRODUCTION)
  }

  static getApiType(originalUrl: string): ENUM_APP_API_TYPE {
    if (originalUrl.includes(ENUM_APP_API_ROUTE.CMS)) {
      return ENUM_APP_API_TYPE.CMS
    } else if (originalUrl.includes(ENUM_APP_API_ROUTE.APP)) {
      return ENUM_APP_API_TYPE.APP
    } else if (originalUrl.includes(ENUM_APP_API_ROUTE.WEB)) {
      return ENUM_APP_API_TYPE.WEB
    }
    return ENUM_APP_API_TYPE.PUB
  }

  static getTemplatePath(fileName: string, language?: string): string {
    const templatePath: string = language
      ? join(APP_PATH, 'resources', 'templates', language, fileName)
      : join(APP_PATH, 'resources', 'templates', fileName)
    return templatePath
  }

  static keyOfEnums<T = string | number>(enums: any, value: string, fallback: string = null): T {
    for (const [key, val] of Object.entries(enums)) {
      if (val === value) return key as T
    }
    if (fallback !== null) {
      return this.keyOfEnums(enums, fallback)
    }
    return null
  }

  static randomItems<T = any>(items: T[], count: number): T[] {
    const shuffled = items.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  static randomNumber(min: number, max: number, step: number = 1): number {
    const range = Math.floor((max - min) / step) + 1
    const randomStep = Math.floor(Math.random() * range)
    return min + randomStep * step
  }

  static toUnique<T = number | string>(list: T[]): T[] {
    return list.filter((value, index, array) => array.indexOf(value) === index)
  }

  static toLocale(language: string | ENUM_MESSAGE_LANGUAGE): string {
    const [lang, locale] = language.replace('-', '_').split('_')
    return locale || lang
  }

  static toLocaleField(
    jsonFields: Record<string, any>[],
    fieldName: string,
    fieldLang: string = 'language',
  ): any {
    return MESSAGE_LANGUAGES.reduce((fields, language) => {
      const jsonField = jsonFields.find((jsonField) => jsonField[fieldLang] === language)
      fields[language] = jsonField?.[fieldName] ?? ''
      return fields
    }, {})
  }

  static toLocaleValue(jsonValue: any, language?: string): string {
    if (jsonValue) {
      return jsonValue[language || AppContext.language()] ?? ''
    }
    return ''
  }

  static toInt(number: number | string | any, def: number = undefined): number {
    return isNaN(number) ? def : Number.parseInt(number)
  }

  static toNumber(number: number, options?: IStringNumericOptions): string {
    const language = options?.language ?? MESSAGE_FALLBACK

    const locale = this.keyOfEnums(ENUM_MESSAGE_LANGUAGE, language, MESSAGE_FALLBACK)
    const formatter = new Intl.NumberFormat(ENUM_NUMBER_LANGUAGE[locale], {
      minimumFractionDigits: options?.minimumFractionDigits,
      maximumFractionDigits: options?.maximumFractionDigits ?? 10,
      useGrouping: options?.useGrouping === true,
    })
    return formatter.format(number).trim()
  }

  static toCurrency(number: number, options?: IStringCurrencyOptions): string {
    const language = options?.language ?? MESSAGE_FALLBACK

    const locale = this.keyOfEnums(ENUM_MESSAGE_LANGUAGE, language, MESSAGE_FALLBACK)
    const formatter = new Intl.NumberFormat(ENUM_NUMBER_LANGUAGE[locale], {
      style: 'currency',
      currency: ENUM_CURRENCY_LANGUAGE[locale],
      minimumFractionDigits: options?.minimumFractionDigits,
      maximumFractionDigits: options?.maximumFractionDigits ?? 10,
      currencyDisplay: language === MESSAGE_FALLBACK ? 'narrowSymbol' : undefined,
      useGrouping: options?.useGrouping ?? false,
    })
    return formatter.format(number).trim()
  }

  static mergeDate(date: Date | string, duration: string): Date {
    if (typeof date === 'string') {
      const [day, month, year] = date.split('/')
      date = `${year}-${month}-${day}`
    }

    const reqDate = new Date(date)
    return this.toDate(reqDate, { duration }) as Date
  }

  static extractDate(date: Date | string): IDateExtractData {
    return new HelperDateService().extract(new Date(date))
  }

  static nowDate(options?: Omit<IDateRequestOptions, 'format'>): Date {
    const reqDate = new Date()
    if (options?.durationSet) {
      if (!options.durationSet?.hour) reqDate.setHours(0)
      if (!options.durationSet?.minute) reqDate.setMinutes(0)
      if (!options.durationSet?.second) reqDate.setSeconds(0)
      if (!options.durationSet?.millisecond) reqDate.setMilliseconds(0)
    }

    return this.toDate(reqDate, options) as Date
  }

  static toDate(date: Date | string, options?: IDateRequestOptions): Date | string {
    const reqDate = new Date(date)
    if (options?.durationSet) {
      if (!options.durationSet?.hour) reqDate.setHours(0)
      if (!options.durationSet?.minute) reqDate.setMinutes(0)
      if (!options.durationSet?.second) reqDate.setSeconds(0)
      if (!options.durationSet?.millisecond) reqDate.setMilliseconds(0)
    }

    const mDate = new HelperDateService().createInstance(reqDate, options)
    return options?.format ? mDate.toFormat(options.format) : mDate.toJSDate()
  }

  static toUrl(path: string, host?: string): string {
    if (!path) return path

    host = host || process.env.APP_URL || APP_URL
    path = path.replaceAll('\\', '/')

    if (this.isDevelopment() && AppContext.apiType() === ENUM_APP_API_TYPE.APP) {
      host = `http://10.0.2.2:3000`
    }
    return `${host}/${path}`
  }
}
