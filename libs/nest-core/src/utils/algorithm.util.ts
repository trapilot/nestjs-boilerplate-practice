export class AlgorithmUtil {
  static lowerBound<T>(array: readonly T[], value: T, comparator: (a: T, b: T) => number): number {
    let first = 0
    let count = array.length

    while (count > 0) {
      const step = Math.trunc(count / 2)
      let it = first + step

      if (comparator(array[it]!, value) <= 0) {
        first = ++it
        count -= step + 1
      } else {
        count = step
      }
    }

    return first
  }

  static getGCD(width: number, height: number): number {
    if (height === 0) return width
    return this.getGCD(height, width % height)
  }
}
