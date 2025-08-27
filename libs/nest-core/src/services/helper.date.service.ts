import { Injectable } from '@nestjs/common'
import { DateObjectUnits, DateTime, Duration, DurationLikeObject } from 'luxon'
import { ENUM_DATE_FORMAT } from '../enums'
import {
  IDateCheckOptions,
  IDateCompareOptions,
  IDateCreateOptions,
  IDateExtractData,
  IDateRange,
  IDateRoundDownOptions,
} from '../interfaces'
import { NestContext } from '../utils'

@Injectable()
export class HelperDateService {
  calculateAge(dateOfBirth: Date, fromYear?: number): Duration {
    const timeZone = NestContext.timezone()
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

  isBirthMonth(month: number, issuedDate?: Date): boolean {
    const extractDate = this.extract(issuedDate)
    return month === extractDate.month
  }

  isBirthDay(dateOfBirth: Date, issuedDate?: Date): boolean {
    const dobExtract = this.extract(dateOfBirth)
    const issExtract = this.extract(issuedDate)
    return dobExtract.month === issExtract.month && dobExtract.day === issExtract.day
  }

  after(dateOne: Date, options?: IDateCompareOptions): boolean {
    const dtDateOne = this.createInstance(dateOne)
    const tzDateOne = this.getZone(dtDateOne.toJSDate())
    const dtDateTwo = this.createInstance(options?.sinceDate, { ...options, timezone: tzDateOne })
    return dtDateTwo > dtDateOne
  }

  before(dateOne: Date, options?: IDateCompareOptions): boolean {
    const dtDateOne = this.createInstance(dateOne)
    const tzDateOne = this.getZone(dtDateOne.toJSDate())
    const dtDateTwo = this.createInstance(options?.sinceDate, { ...options, timezone: tzDateOne })
    return dtDateTwo < dtDateOne
  }

  checkIso(date: string): boolean {
    return DateTime.fromISO(date).setZone(NestContext.timezone()).isValid
  }

  checkTimestamp(timestamp: number): boolean {
    return DateTime.fromMillis(timestamp).setZone(NestContext.timezone()).isValid
  }

  checkZone(timezone: string): boolean {
    return DateTime.fromObject({}, { zone: timezone }).isValid
  }

  getZone(date: Date): string {
    return DateTime.fromJSDate(date).setZone(NestContext.timezone()).zone.name
  }

  getZoneOffset(date: Date): string {
    return DateTime.fromJSDate(date).setZone(NestContext.timezone()).offsetNameShort
  }

  getTimestamp(date: Date): number {
    return DateTime.fromJSDate(date).setZone(NestContext.timezone()).toMillis()
  }

  formatToRFC2822(date: Date): string {
    return DateTime.fromJSDate(date).setZone(NestContext.timezone()).toRFC2822()
  }

  formatToIso(date: Date): string {
    return DateTime.fromJSDate(date).setZone(NestContext.timezone()).toISO()
  }

  formatToIsoDate(date: Date): string {
    return DateTime.fromJSDate(date).setZone(NestContext.timezone()).toISODate()
  }

  formatToIsoTime(date: Date): string {
    return DateTime.fromJSDate(date).setZone(NestContext.timezone()).toISOTime()
  }

  checkDates(dateOne: Date, dateTwoMoreThanDateOne: Date, options: IDateCheckOptions): boolean {
    const mDateOne = this.extract(dateOne)
    const mDateTwo = this.extract(dateTwoMoreThanDateOne)
    if (options?.perYear && mDateOne.year === mDateTwo.year) return false
    if (options?.inYear && mDateOne.year !== mDateTwo.year) return false
    if (options?.inMonth && mDateOne.month !== mDateTwo.month) return false
    if (options?.inDay && mDateOne.day !== mDateTwo.day) return false
    return true
  }

  createInstance(date?: Date, options?: IDateCreateOptions): DateTime {
    const timezone = options?.timezone ?? NestContext.timezone()
    let mDate = date
      ? DateTime.fromJSDate(date).setZone(timezone)
      : DateTime.now().setZone(timezone)

    if (options?.startOfDay) {
      mDate = mDate.startOf('day')
    } else if (options?.endOfDay) {
      mDate = mDate.endOf('day')
    } else if (options?.duration) {
      const [hour, minute, second, millisecond] = options.duration.split(':').map(Number)
      mDate = mDate.set({ hour, minute, second, millisecond })
    }

    return mDate
  }

  static make(date?: Date, options?: IDateCreateOptions): Date {
    return new HelperDateService().createInstance(date, options).toJSDate()
  }

  create(date?: Date, options?: IDateCreateOptions): Date {
    return this.createInstance(date, options).toJSDate()
  }

  createRange(date?: Date): IDateRange {
    const mDate = this.createInstance(date)
    return {
      startOfDay: mDate.startOf('day').toJSDate(),
      endOfDay: mDate.endOf('day').toJSDate(),
      startOfMonth: mDate.startOf('month').toJSDate(),
      endOfMonth: mDate.endOf('month').toJSDate(),
      startOfYear: mDate.startOf('year').toJSDate(),
      endOfYear: mDate.endOf('year').toJSDate(),
    }
  }

  createFromIso(iso: string, options?: IDateCreateOptions): Date {
    const timezone = options?.timezone ?? NestContext.timezone()
    let mDate = DateTime.fromISO(iso).setZone(timezone)

    if (options?.startOfDay) {
      mDate = mDate.startOf('day')
    } else if (options?.endOfDay) {
      mDate = mDate.endOf('day')
    } else if (options?.duration) {
      const [hours, minutes, seconds, millisecond] = options.duration.split(':').map(Number)
      mDate = mDate.plus(Duration.fromObject({ hours, minutes, seconds, millisecond }))
    }

    return mDate.toJSDate()
  }

  createFromTimestamp(timestamp?: number, options?: IDateCreateOptions): Date {
    const timezone = options?.timezone ?? NestContext.timezone()
    let mDate = timestamp
      ? DateTime.fromMillis(timestamp).setZone(timezone)
      : DateTime.now().setZone(timezone)

    if (options?.startOfDay) {
      mDate = mDate.startOf('day')
    } else if (options?.endOfDay) {
      mDate = mDate.endOf('day')
    } else if (options?.duration) {
      const [hours, minutes, seconds, millisecond] = options.duration.split(':').map(Number)
      mDate = mDate.plus(Duration.fromObject({ hours, minutes, seconds, millisecond }))
    }

    return mDate.toJSDate()
  }

  format(date: Date, dateFormat: ENUM_DATE_FORMAT): string {
    return this.createInstance(date).toFormat(dateFormat)
  }

  set(date: Date, units: DateObjectUnits): Date {
    return DateTime.fromJSDate(date).setZone(NestContext.timezone()).set(units).toJSDate()
  }

  forward(date: Date, duration: DurationLikeObject): Date {
    return DateTime.fromJSDate(date)
      .setZone(NestContext.timezone())
      .plus(Duration.fromObject(duration))
      .toJSDate()
  }

  backward(date: Date, duration: DurationLikeObject): Date {
    return DateTime.fromJSDate(date)
      .setZone(NestContext.timezone())
      .minus(Duration.fromObject(duration))
      .toJSDate()
  }

  extract(date: Date): IDateExtractData {
    const mDate = this.createInstance(date)
    return {
      date: mDate.toJSDate(),
      second: mDate.second,
      minute: mDate.minute,
      hour: mDate.hour,
      weekday: mDate.weekday,
      day: mDate.day,
      month: mDate.month,
      year: mDate.year,
    }
  }

  roundDown(date: Date, options?: IDateRoundDownOptions): Date {
    return this.set(date, {
      hour: options?.hour ? 0 : undefined,
      minute: options?.minute ? 0 : undefined,
      second: options?.second ? 0 : undefined,
      millisecond: options?.millisecond ? 0 : undefined,
    })
  }
}
