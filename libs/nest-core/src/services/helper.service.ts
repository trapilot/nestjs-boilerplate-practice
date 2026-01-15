import { Injectable } from '@nestjs/common'
import { DateObjectUnits, DateTime, Duration, DurationLikeObject } from 'luxon'
import RandExp from 'randexp'
import { EnumCountryCode, EnumDateFormat } from '../enums'
import { ScopeContext } from '../helpers'
import {
  IDateCompareOptions,
  IDateCreateOptions,
  IDateExtractData,
  IDateRange,
  IStringRandomOptions,
} from '../interfaces'
import { ArrUtil, DateUtil } from '../utils'

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
    const _a = a.filter(x => !b.includes(x))
    return [..._a, ...b.filter(x => !_a.includes(x) && !a.includes(x))]
  }

  arrayIntersection<T>(a: T[], b: T[]): T[] {
    if (a.length === 0 || b.length === 0) return []
    const _a = a.filter(x => b.includes(x))
    return [..._a, ...b.filter(x => !_a.includes(x) && a.includes(x))]
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

  calculateAge(dateOfBirth: Date, fromYear?: number): Duration {
    const timeZone = ScopeContext.getReqZone()
    const dateTime = DateTime.now().setZone(timeZone).plus({ day: 1 }).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
    const dateTimeDob = DateTime.fromJSDate(dateOfBirth).setZone(timeZone).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })

    if (fromYear) {
      dateTime.set({ year: fromYear })
    }

    return dateTime.diff(dateTimeDob)
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

  dirtyString(text: string, dirty?: string | number): string {
    if (!text) return text
    dirty = dirty ?? new Date().getTime()
    return ArrUtil.join([text, dirty], { delimiter: '_' })
  }

  padZero(text: string | number, length: number = 1, prefix: string = ''): string {
    return prefix + `${text}`.padStart(Math.max(length, `${text}`.length), '0')
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

    return patterns.some(pattern => {
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
    const country = Object.values(EnumCountryCode).find(code => phone.startsWith(code)) || ''
    return {
      country,
      phone: phone.slice(country.length).trim(),
    }
  }

  dateNow(): Date {
    return DateUtil.current().toJSDate()
  }

  dateCreate(date: Date, options?: IDateCreateOptions): Date {
    return DateUtil.create(date, options).toJSDate()
  }

  dateInstance(date: Date, options?: IDateCreateOptions): DateTime {
    return DateUtil.create(date, options)
  }

  dateCreateFromIso(iso: string, options?: IDateCreateOptions): Date {
    const timezone = options?.timezone ?? ScopeContext.getReqZone()
    let mDate = DateTime.fromISO(iso).setZone(timezone)

    if (options?.startOfDay) {
      mDate = mDate.startOf('day')
    } else if (options?.endOfDay) {
      mDate = mDate.endOf('day')
    } else if (options?.durationSet) {
      mDate = mDate.set(options.durationSet)
    }

    return mDate.toJSDate()
  }

  dateGetZone(date: Date): string {
    return DateTime.fromJSDate(date).setZone(ScopeContext.getReqZone()).zone.name
  }

  dateGetZoneOffset(date: Date): string {
    return DateTime.fromJSDate(date).setZone(ScopeContext.getReqZone()).offsetNameShort
  }

  dateGetTimestamp(date: Date): number {
    return DateTime.fromJSDate(date).setZone(ScopeContext.getReqZone()).toMillis()
  }

  dateFormat(date: Date, dateFormat: EnumDateFormat): string {
    return DateUtil.format(date, { format: dateFormat })
  }

  dateRange(date: Date): IDateRange {
    return DateUtil.rangeDate(date)
  }

  dateExtract(date: Date): IDateExtractData {
    return DateUtil.extractDate(date)
  }

  dateSet(date: Date, units: DateObjectUnits): Date {
    return DateTime.fromJSDate(date).setZone(ScopeContext.getReqZone()).set(units).toJSDate()
  }

  dateForward(date: Date, duration: DurationLikeObject): Date {
    return DateTime.fromJSDate(date)
      .setZone(ScopeContext.getReqZone())
      .plus(Duration.fromObject(duration))
      .toJSDate()
  }

  dateBackward(date: Date, duration: DurationLikeObject): Date {
    return DateTime.fromJSDate(date)
      .setZone(ScopeContext.getReqZone())
      .minus(Duration.fromObject(duration))
      .toJSDate()
  }

  dateCheckAfter(dateOne: Date, options?: IDateCompareOptions): boolean {
    const dtDateOne = DateUtil.create(dateOne)
    const dtDateTwo = DateUtil.create(options?.sinceDate, {
      ...options,
      timezone: this.dateGetZone(dtDateOne.toJSDate()),
    })
    return dtDateTwo > dtDateOne
  }

  dateCheckBefore(dateOne: Date, options?: IDateCompareOptions): boolean {
    const dtDateOne = DateUtil.create(dateOne)
    const dtDateTwo = DateUtil.create(options?.sinceDate, {
      ...options,
      timezone: this.dateGetZone(dtDateOne.toJSDate()),
    })
    return dtDateTwo < dtDateOne
  }

  dateCheckSet(date: Date, options: Partial<Omit<IDateExtractData, 'date'>>): boolean {
    const extractDate = this.dateExtract(date)
    if (options?.year && extractDate.year != options.year) return false
    if (options?.month && extractDate.month != options.month) return false
    if (options?.day && extractDate.day != options.day) return false
    if (options?.weekday && extractDate.weekday != options.weekday) return false
    if (options?.hour && extractDate.hour != options.hour) return false
    if (options?.minute && extractDate.minute != options.minute) return false
    if (options?.second && extractDate.second != options.second) return false
    return true
  }

  dateCheckIso(date: string): boolean {
    return DateTime.fromISO(date).setZone(ScopeContext.getReqLang()).isValid
  }

  dateCheckTimestamp(timestamp: number): boolean {
    return DateTime.fromMillis(timestamp).setZone(ScopeContext.getReqLang()).isValid
  }

  dateCheckZone(timezone: string): boolean {
    return DateTime.fromObject({}, { zone: timezone }).isValid
  }
}
