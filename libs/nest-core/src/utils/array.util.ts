import { IArrayFindOptions, IArrayJoinOptions } from '../interfaces'

export class ArrUtil {
  static unique<T = number | string>(list: T[]): T[] {
    return list.filter((value, index, array) => array.indexOf(value) === index)
  }

  static has<T = number | string>(list: T[], value: T): boolean {
    return list.includes(value)
  }

  static join<T = number | string>(list: T[], options: IArrayJoinOptions): string {
    if (options?.allowEmpty !== false) {
      return list.join(options.delimiter)
    }
    return list.filter((v) => v && `${v}`.length).join(options.delimiter)
  }

  static find<T = any>(list: T[], options: IArrayFindOptions<string | T>): T {
    if (options?.field) {
      return list.find((v) => v[options.field] === options.value)
    }
    return list.find((v) => v === options.value)
  }
}
