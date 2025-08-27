import { Injectable } from '@nestjs/common'
import { IArrayRemove } from '../interfaces'

@Injectable()
export class HelperArrayService {
  removeByValue<T>(array: T[], value: T): IArrayRemove<T> {
    const removed = []
    const arrays = []
    array.forEach((v, i) => {
      value == v ? removed.push(i) : arrays.push(v)
    })
    return { removed, arrays }
  }

  joinToString<T>(array: Array<T>, delimiter: string = ''): string {
    return array.join(delimiter)
  }

  reverse<T>(array: T[]): T[] {
    return array.reverse()
  }

  unique<T>(array: T[]): T[] {
    return [...new Set(array)]
  }

  merge<T>(a: T[], b: T[]): T[] {
    return a.concat(b)
  }

  minOfNumbers<T = Number>(a: T[]): T {
    return Math.min.apply(null, a)
  }

  maxOfNumbers<T = Number>(a: T[]): T {
    return Math.max.apply(null, a)
  }

  getDifference<T>(a: T[], b: T[]): T[] {
    if (b.length === 0) return a
    if (a.length === 0) return b
    const _a = a.filter((x) => !b.includes(x))
    return [..._a, ...b.filter((x) => !_a.includes(x) && !a.includes(x))]
  }

  getIntersection<T>(a: T[], b: T[]): T[] {
    if (a.length === 0 || b.length === 0) return []
    const _a = a.filter((x) => b.includes(x))
    return [..._a, ...b.filter((x) => !_a.includes(x) && a.includes(x))]
  }

  includes<T>(a: T[], b: T): boolean {
    return a.includes(b)
  }

  excludes<T>(a: T[], b: T): boolean {
    return !a.includes(b)
  }

  in<T>(a: T[], b: T[]): boolean {
    const intersections = this.getIntersection(a, b)
    return intersections.length > 0
  }

  notIn<T>(a: T[], b: T[]): boolean {
    const differences = this.getDifference(a, b)
    return differences.length === 0
  }

  chunk<T>(a: T[], size: number): T[][] {
    return a.reduce((c, i, index) => {
      const idx = Math.floor(index / size)
      if (!c[idx]) c[idx] = []
      c[idx].push(i)
      return c
    }, [])
  }

  group<T>(a: T[], size: number): T[][] {
    const c = Array.from({ length: size }, () => [])
    let idx = 0
    for (const i of a) {
      c[idx % size].push(i)
      idx++
    }
    return c
  }
}
