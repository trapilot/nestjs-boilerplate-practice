import { IStringParseOptions } from '../interfaces'

export class StringUtil {
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
}
