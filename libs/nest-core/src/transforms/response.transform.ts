import { ClassConstructor, plainToInstance, Transform } from 'class-transformer'
import { EnumRouteType } from '../enums'
import { ScopeContext } from '../helpers'
import { IDateFormatOptions, INumberReturnOptions } from '../interfaces'
import { AppUtil, DateUtil, LocaleUtil, NumberUtil } from '../utils'

export function ToUrl(host?: string): (target: any, key: string) => void {
  return Transform(({ value: path }: any) => {
    return AppUtil.buildUrl(path, host)
  })
}

export function ToDate(
  transform?: { ref?: string } & IDateFormatOptions,
): (target: any, key: string) => void {
  return Transform(({ value, obj }: any) => {
    const { ref, ...options } = transform ?? {}
    if (ref) value = obj[ref] ?? undefined
    return value ? DateUtil.format(value, options) : value
  })
}

export function ToDuration(transform?: {
  ref?: string
  parts?: number
}): (target: any, key: string) => void {
  return Transform(({ value, obj }: any) => {
    if (transform?.ref) value = obj[transform.ref] ?? undefined

    if (!value || typeof value !== 'string') return undefined

    const parts = value.split(':').map((v: string) => v.padStart(2, '0'))
    const [h = '00', m = '00', s = '00', ms = '000'] = (() => {
      switch (parts.length) {
        case 2:
          return [parts[0], parts[1], '00', '000']
        case 3:
          return [parts[0], parts[1], parts[2], '000']
        case 4:
          return parts
        default:
          return ['00', '00', '00', '000']
      }
    })()
    const duration = `${h}:${m}:${s}:${ms.padEnd(3, '0').slice(0, 3)}`
    return transform?.parts ? duration.split(':').splice(0, transform.parts).join(':') : duration
  })
}

export function ToEnum(
  enums: any,
  transform?: { path?: string; default?: any; locale?: boolean },
): (target: any, key: string) => void {
  return Transform(({ value, obj }: any) => {
    if (transform?.path) {
      const properties = transform?.path.split('.')
      if (properties.length) {
        const nestedField = properties.shift()
        value = obj[nestedField]
        while (value && properties.length) {
          value = value[properties.shift()] || transform?.default
        }

        if (value && transform.locale) {
          value = value[ScopeContext.getReqLang()] || transform?.default
        }

        return enums[value] || transform?.default
      }
    }
    return enums[value] || transform?.default
  })
}

export function ToDecimal(options?: INumberReturnOptions): (target: any, key: string) => void {
  return Transform(({ value, obj, key }: any) => {
    const decimal = value ?? obj[key.replace('Format', '')]
    if (typeof decimal === 'number') {
      return NumberUtil.decimal(decimal ?? 0, {
        useGrouping: !ScopeContext.isReqRoute(EnumRouteType.CMS),
        ...options,
      })
    }
    return decimal
  })
}

export function ToCurrency(options?: INumberReturnOptions): (target: any, key: string) => void {
  return Transform(({ value, obj, key }: any) => {
    return NumberUtil.currency(value ?? obj[key.replace('Format', '')] ?? 0, {
      useGrouping: !ScopeContext.isReqRoute(EnumRouteType.CMS),
      ...options,
    })
  })
}

export function ToPercent(): (target: any, key: string) => void {
  return Transform(({ value, obj, key }: any) => {
    // return `${value ?? obj[key.replace('Format', '')] ?? 0}%`
    return NumberUtil.currency(value ?? obj[key.replace('Format', '')] ?? 0, {
      useGrouping: !ScopeContext.isReqRoute(EnumRouteType.CMS),
    })
  })
}

export function ToNestedArray<T>(transform: {
  path: string
  root?: ClassConstructor<any>
  type?: ClassConstructor<T>
  default?: T[]
  locale?: boolean
}): (target: any, key: string) => void {
  return Transform(({ obj }: any) => {
    const properties = transform.path.split('.')
    if (properties.length) {
      const nestedField = properties.shift()
      if (nestedField in obj) {
        const results = []

        const dtos = obj[nestedField]
        for (const dto of dtos) {
          const dtoProperties = [...properties]
          let data = transform?.root
            ? plainToInstance(transform?.root, dto, { excludeExtraneousValues: true })
            : dto

          while (data && dtoProperties.length) {
            data = data[dtoProperties.shift()] || transform?.default
          }

          if (data && transform.locale) {
            data = data[ScopeContext.getReqLang()] || transform?.default
          }
          if (data && transform?.type) {
            data = plainToInstance(transform.type, data, { excludeExtraneousValues: true })
          }
          results.push(data)
        }
        return results ?? transform?.default
      }
    }
    return transform?.default
  })
}

export function ToNestedField<T>(transform: {
  path: string
  root?: ClassConstructor<any>
  type?: ClassConstructor<T>
  default?: T
  locale?: boolean
}): (target: any, key: string) => void {
  return Transform(({ obj }: any) => {
    const properties = transform.path.split('.')
    if (properties.length) {
      const nestedField = properties.shift()
      let data = transform?.root
        ? plainToInstance(transform?.root, obj[nestedField], { excludeExtraneousValues: true })
        : obj[nestedField]

      while (data && properties.length) {
        data = data[properties.shift()]
      }

      if (data && transform.locale) {
        data = data[ScopeContext.getReqLang()] || transform?.default
      }
      if (data && transform?.type) {
        return plainToInstance(transform.type, data, { excludeExtraneousValues: true })
      }
      return data ?? transform?.default
    }
    return transform?.default
  })
}

export function ToLocaleField<T>(transform: {
  path?: string
  root?: ClassConstructor<any>
  type?: ClassConstructor<T>
  default?: T
}): (target: any, key: string) => void {
  return Transform(({ obj, key }: any) => {
    const properties = (transform?.path ?? 'languages').split('.')
    if (properties.length) {
      const nestedField = properties.shift()
      let data = transform?.root
        ? plainToInstance(transform?.root, obj[nestedField], { excludeExtraneousValues: true })
        : obj[nestedField]

      while (data && properties.length) {
        data = data[properties.shift()]
      }

      if (data) {
        data = LocaleUtil.buildFields(data, key)
      }

      if (data && transform?.type) {
        return plainToInstance(transform.type, data, { excludeExtraneousValues: true })
      }
      return data ?? transform?.default
    }
    return transform?.default
  })
}

export function ToLocale(field?: string): (target: any, key: string) => void {
  return Transform(({ obj, value }: any) => {
    if (field) value = obj[field] ?? null
    return value ? value[ScopeContext.getReqLang()] : value
  })
}

export function ToPureString(suffix: string = '_'): (target: any, key: string) => void {
  return Transform(({ value }: any) => {
    return (value || '').split(suffix)[0]
  })
}
