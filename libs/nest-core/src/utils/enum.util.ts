import { EnumLike, EnumValue } from '../interfaces'

export class EnumUtil {
  static isEnum(data: any): boolean {
    if (!data || typeof data !== 'object') return false
    return Object.values(data).some((v) => typeof v === 'string' || typeof v === 'number')
  }

  static relative<T = EnumValue>(
    value: T,
    options: { enumRoot: EnumLike<T>; enumRelative: EnumLike<T> },
  ): T {
    const enumKey = this.findKey<any>(value, { enum: options.enumRoot })
    return options.enumRelative[enumKey] as T
  }

  static enumToStrings(value: EnumLike | string[]): string[] {
    if (Array.isArray(value)) return value
    return Object.values(value).filter((v): v is string => typeof v === 'string')
  }

  static findKey<T = EnumValue>(value: T, options: { enum: EnumLike<T>; fallback?: T }): T {
    for (const [k, v] of Object.entries(options.enum)) {
      if (v == value) return k as T
    }
    if (options?.fallback !== undefined) {
      return this.findKey(options.fallback, { enum: options.enum })
    }
    return null
  }

  static filterKeys<T = EnumValue>(value: T, options: { enum: EnumLike<T>; fallback?: T }): T[] {
    const keys = []
    for (const [k, v] of Object.entries(options.enum)) {
      if (v == value) keys.push(k)
    }
    if (keys.length === 0 && options?.fallback !== undefined) {
      return this.filterKeys(options.fallback, { enum: options.enum })
    }
    return keys
  }

  static filterValues<T = EnumValue>(value: T[], options: { enum: EnumLike<T> }): T[] {
    const values = []
    for (const [k, v] of Object.entries(options.enum)) {
      if (value.includes(v)) values.push(k)
    }
    return values
  }
}
