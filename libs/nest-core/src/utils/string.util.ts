import { IStringCapitalizeOptions, IStringParseOptions, IStringSplitOptions } from '../interfaces'

export class StrUtil {
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

  static split(value: string, options: IStringSplitOptions): string[] {
    if (options?.allowEmpty !== false) {
      return value.split(options.delimiter, options?.maxSplit)
    }

    const finalValue = value.split(options.delimiter).filter((v) => v)
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
        .replace(/^./, (c) => c.toUpperCase())
    }
    return value.charAt(0).toUpperCase() + value.slice(1)
  }
}
