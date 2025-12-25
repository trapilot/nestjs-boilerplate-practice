import {
  ClassConstructor,
  ClassTransformOptions,
  plainToInstance,
  Transform,
  TransformFnParams,
} from 'class-transformer'
import { EnumLike } from '../interfaces'
import { EnumUtil } from '../utils'

export function TransformIf(conditionFn: Function): (target: any, key: string) => void {
  return Transform((params: TransformFnParams) => {
    return conditionFn(params.obj, params.value) ? params.value : null
  })
}

export function ToObject(transform: {
  type: ClassConstructor<any>
  options?: ClassTransformOptions
}): (target: any, key: string) => void {
  return Transform(({ value }: any) => {
    if (value && typeof value === 'string') {
      return plainToInstance(transform.type, JSON.parse(value), transform?.options)
    }
    return value
  })
}

export function ToArray(
  transform?: {
    type?: ClassConstructor<any> | EnumLike
  } & ClassTransformOptions,
): (target: any, key: string) => void {
  return Transform(({ value }: any) => {
    const { type, ...options } = transform ?? {}
    if (value && typeof value === 'string') {
      // Clean the string to remove unnecessary escaping
      value = value.replace(/\\"/g, '"')
      value = value.replace(/\\n  /g, '')
      value = value.replace(/\\n/g, '')
      value = value.replace('}","{', '},{')
      value = value.replace('},"{', '},{')
      value = value.replace('["{', '[{')
      value = value.replace('}"]', '}]')
      try {
        const parsed = JSON.parse(`[${value}]`.replace(/\[\[/, '[').replace(/\]\]/, ']'))
        value = parsed
      } catch {}
    }
    if (type) {
      if (EnumUtil.isEnum(type)) {
        return EnumUtil.filterEnumValues(value.split(','), { enum: type as EnumLike })
      }
      return plainToInstance(type as ClassConstructor<any>, value, options)
    }
    return value
  })
}

export function ToEmail(): (target: any, key: string) => void {
  return Transform(({ value }: any) => {
    if (typeof value === 'string') {
      return value
    }
    return value ? `${value}` : value
  })
}

export function ToPhone(): (target: any, key: string) => void {
  return Transform(({ value }: any) => {
    if (typeof value === 'string') {
      return `${value}`.replace(/\D/g, '')
    }
    return value ? `${value}`.replace(/\D/g, '') : value
  })
}

export function ToString(): (target: any, key: string) => void {
  return Transform(({ value }: any) => {
    if (typeof value === 'string') {
      return value
    }
    return value ? `${value}` : value
  })
}

export function ToNumber(): (target: any, key: string) => void {
  return Transform(({ value }: any) => {
    if (typeof value === 'string') {
      return Number(value)
    }
    return value
  })
}

export function ToBoolean(): (target: any, key: string) => void {
  return Transform(({ value }: any) => {
    if (typeof value === 'string') {
      return ['true'].includes(value)
    }
    return value
  })
}
