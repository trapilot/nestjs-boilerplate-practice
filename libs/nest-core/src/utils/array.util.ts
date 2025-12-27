import { IArrayJoinOptions } from '../interfaces'

export class ArrUtil {
  static unique<T = number | string>(list: T[]): T[] {
    return list.filter((value, index, array) => array.indexOf(value) === index)
  }

  static join<T = number | string>(list: T[], options: IArrayJoinOptions): string {
    if (options?.allowEmpty !== false) {
      return list.join(options.delimiter)
    }
    return list.filter((v) => `${v}`.length).join(options.delimiter)
  }
}
