export class ArrayUtil {
  static unique<T = number | string>(list: T[]): T[] {
    return list.filter((value, index, array) => array.indexOf(value) === index)
  }
}
