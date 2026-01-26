import ms from 'ms'
import {
  IStringCapitalizeOptions,
  IStringFormatOptions,
  IStringParseEnumOptions,
  IStringParseOptions,
  IStringSplitOptions,
} from '../interfaces'
import { AppUtil } from './app.util'

export class StrUtil {
  static format(value: string, options?: IStringFormatOptions): string {
    if (options?.spaceless) {
      value = value.replace(/\s+/g, '')
    }

    if (options?.length) {
      value = value.slice(0, options.length)
    }

    if (options?.slices) {
      let cursor = 0
      const parts: string[] = []

      for (const len of options.slices.parts) {
        if (cursor >= value.length) break
        parts.push(value.slice(cursor, cursor + len))
        cursor += len
      }

      // the rest (if any)
      if (cursor < value.length) {
        parts.push(value.slice(cursor))
      }

      value = parts.join(options.slices.delimiter)
    }

    if (options?.format === 'uppercase') return value.toUpperCase()
    if (options?.format === 'lowercase') return value.toLowerCase()
    if (options?.format === 'capitalize') return this.capitalize(value)
    return value
  }

  static parse<T = any>(value: string, options: IStringParseOptions): T {
    let finalValue: any = value
    const defValue: any = options?.errorAs

    if (value === undefined) {
      return defValue
    }

    switch (options.parseAs) {
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
      case 'seconds':
        finalValue = AppUtil.seconds(value as ms.StringValue)
        break
      case 'miliseconds':
        finalValue = AppUtil.ms(value as ms.StringValue)
        break
    }
    return finalValue as T
  }

  static safeEnum<T>(value: string, options: IStringParseEnumOptions<T>): T {
    if (!value) return options.fallback

    const normalized = String(value).toLowerCase() as T

    const values = Object.values(options.enum)

    return values.includes(normalized) ? normalized : options.fallback
  }

  static split(value: string, options: IStringSplitOptions): string[] {
    if (!value) return []

    if (options?.allowEmpty !== false) {
      return value.split(options.delimiter, options?.maxSplit)
    }

    const finalValue = value.split(options.delimiter).filter(v => v)
    if (options?.maxSplit) {
      return finalValue.join(options.delimiter).split(options.delimiter, options?.maxSplit)
    }
    return finalValue
  }

  static capitalize(value: string, options?: IStringCapitalizeOptions): string {
    if (options?.splitWords === true) {
      return value
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/^./, c => c.toUpperCase())
    }
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  static numeric(value: string, defaultValue?: number): number {
    return this.parse<number>(value, {
      parseAs: 'number',
      errorAs: defaultValue,
    })
  }

  static ms(value: string, defaultValue?: string): number {
    return this.parse<number>(value, {
      parseAs: 'miliseconds',
      errorAs: this.parse<number>(defaultValue, {
        parseAs: 'miliseconds',
      }),
    })
  }

  static seconds(value: string, defaultValue?: string): number {
    return this.parse<number>(value, {
      parseAs: 'seconds',
      errorAs: this.parse<number>(defaultValue, {
        parseAs: 'seconds',
      }),
    })
  }

  static isNumber(value: string): boolean {
    const regex = /^-?\d+$/
    return regex.test(value)
  }

  static isJson(value: string): boolean {
    try {
      const parsed = JSON.parse(value)
      return typeof parsed === 'object' && parsed !== null
    } catch {}
    return false
  }

  static isArray(value: string): boolean {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed)
    } catch {}
    return false
  }

  static isTrue(value: string, def: boolean = false): boolean {
    if (value === undefined) return def
    return value === 'true'
  }

  static isNotTrue(value: string, def: boolean = false): boolean {
    if (value === undefined) return def
    return value !== 'true'
  }
}
