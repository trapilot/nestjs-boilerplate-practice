import { Injectable } from '@nestjs/common'
import RandExp from 'randexp'
import { ENUM_COUNTRY_CODE } from '../enums'
import { IStringEmailValidation, IStringRandomOptions } from '../interfaces'

@Injectable()
export class HelperService {
  arrayReverse<T>(array: T[]): T[] {
    return array.reverse()
  }

  arrayUnique<T>(array: T[]): T[] {
    return [...new Set(array)]
  }

  arrayMerge<T>(a: T[], b: T[]): T[] {
    return a.concat(b)
  }

  arrayDifference<T>(a: T[], b: T[]): T[] {
    if (b.length === 0) return a
    if (a.length === 0) return b
    const _a = a.filter((x) => !b.includes(x))
    return [..._a, ...b.filter((x) => !_a.includes(x) && !a.includes(x))]
  }

  arrayIntersection<T>(a: T[], b: T[]): T[] {
    if (a.length === 0 || b.length === 0) return []
    const _a = a.filter((x) => b.includes(x))
    return [..._a, ...b.filter((x) => !_a.includes(x) && a.includes(x))]
  }

  arrayChunk<T>(a: T[], size: number): T[][] {
    return a.reduce((c, i, index) => {
      const idx = Math.floor(index / size)
      if (!c[idx]) c[idx] = []
      c[idx].push(i)
      return c
    }, [])
  }

  arrayGroup<T>(a: T[], size: number): T[][] {
    const c = Array.from({ length: size }, () => [])
    let idx = 0
    for (const i of a) {
      c[idx % size].push(i)
      idx++
    }
    return c
  }

  checkNumberString(number: string): boolean {
    const regex = /^-?\d+$/
    return regex.test(number)
  }

  randomDigits(length: number): string {
    const min: number = Number.parseInt(`1`.padEnd(length, '0'))
    const max: number = Number.parseInt(`9`.padEnd(length, '9'))
    return this.randomNumberInRange(min, max).toString()
  }

  randomNumberInRange(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
  }

  calculatePercent(value: number, total: number): number {
    let tValue = value / total
    if (Number.isNaN(tValue) || !Number.isFinite(tValue)) {
      tValue = 0
    }
    return Number.parseFloat((tValue * 100).toFixed(2))
  }

  randomString(length: number, options?: IStringRandomOptions): string {
    if (options?.numeric) {
      return new RandExp(`[0-9]{${length},${length}}`).gen()
    }
    let rString = options?.safe
      ? new RandExp(`[A-Z]{${length},${length}}`).gen()
      : new RandExp(`\\w{${length},${length}}`).gen()
    if (options?.upperCase) {
      rString = rString.toUpperCase()
    }
    return options?.prefix ? `${options.prefix}${rString}` : rString
  }

  censorString(text: string): string {
    if (text.length <= 5) {
      const stringCensor = '*'.repeat(text.length - 1)
      return `${stringCensor}${text.slice(-1)}`
    } else if (text.length <= 10) {
      const stringCensor = '*'.repeat(text.length - 3)
      return `${stringCensor}${text.slice(-3)}`
    } else if (text.length <= 25) {
      const lengthExplicit = Math.ceil((text.length / 100) * 30)
      const lengthCensor = Math.ceil((text.length / 100) * 50)
      const stringCensor = '*'.repeat(lengthCensor)
      return `${stringCensor}${text.slice(-lengthExplicit)}`
    }
    const stringCensor = '*'.repeat(10)
    const lengthExplicit = Math.ceil((text.length / 100) * 30)
    return `${text.slice(0, 3)}${stringCensor}${text.slice(-lengthExplicit)}`
  }

  dirtyString(text: string, suffix?: string | number): string {
    if (!text) return text
    suffix = suffix ?? new Date().getTime()
    return [text, suffix].join('_')
  }

  padZero(text: string | number, length: number = 1, prefix: string = ''): string {
    return prefix + `${text}`.padStart(Math.max(length, `${text}`.length), '0')
  }

  checkEmail(value: string): IStringEmailValidation {
    const regex = new RegExp(/\S@\S\.\S/)
    const valid = regex.test(value)
    if (!valid) {
      return {
        validated: false,
        message: 'request.email.invalid',
      }
    }

    const atSymbolCount = (value.match(/@/g) || []).length
    if (atSymbolCount !== 1) {
      return {
        validated: false,
        message: 'request.email.multipleAtSymbols',
      }
    }

    const [localPart, domain] = value.split('@')

    // Add minimum length check for local part
    if (!localPart || localPart.length === 0) {
      return {
        validated: false,
        message: 'request.email.localPartNotEmpty',
      }
    } else if (!domain || domain.length > 255) {
      return {
        validated: false,
        message: 'request.email.domainLength',
      }
    } else if (localPart.length > 64) {
      return {
        validated: false,
        message: 'request.email.localPartMaxLength',
      }
    } else if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return {
        validated: false,
        message: 'request.email.localPartDot',
      }
    } else if (localPart.includes('..')) {
      return {
        validated: false,
        message: 'request.email.consecutiveDots',
      }
    }

    const allowedLocalPartChars = /^[a-zA-Z0-9-_.]$/
    if (!allowedLocalPartChars.test(localPart)) {
      return {
        validated: false,
        message: 'request.email.invalidChars',
      }
    }
    return
  }

  checkUrlMatchesPatterns(url: string, patterns: string[]): boolean {
    if (!url || !patterns?.length) {
      return false
    }

    let pathname: string
    try {
      const urlObj = new URL(url)
      pathname = urlObj.pathname
    } catch {
      pathname = url.split('?')[0].split('#')[0]
    }

    const normalizedPath = pathname.toLowerCase()

    return patterns.some((pattern) => {
      if (!pattern) {
        return false
      }

      const normalizedPattern = pattern.toLowerCase()

      if (normalizedPath === normalizedPattern) {
        return true
      }

      if (!pattern.includes('*')) {
        return false
      }

      try {
        if (normalizedPattern === '*') {
          return true
        }

        if (normalizedPattern.endsWith('*')) {
          const basePattern = normalizedPattern.slice(0, -1)

          if (!basePattern) {
            return true
          }

          if (basePattern.endsWith('/')) {
            return normalizedPath.startsWith(basePattern)
          }

          return normalizedPath === basePattern || normalizedPath.startsWith(basePattern + '/')
        }

        const regexPattern = normalizedPattern
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*')

        const regex = new RegExp(`^${regexPattern}$`)
        return regex.test(normalizedPath)
      } catch {
        return false
      }
    })
  }

  createPhone(country: string, phone?: string): string {
    return `${country ?? ''}${phone}`
  }

  parsePhone(phone: string): { country: string; phone: string } {
    const country = Object.values(ENUM_COUNTRY_CODE).find((code) => phone.startsWith(code)) || ''
    return {
      country,
      phone: phone.slice(country.length).trim(),
    }
  }
}
