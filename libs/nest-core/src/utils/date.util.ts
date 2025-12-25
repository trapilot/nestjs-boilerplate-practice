import { DateTime } from 'luxon'
import { AppContext } from '../contexts'
import {
  IDateCreateOptions,
  IDateExtractData,
  IDateRange,
  IDateRequestOptions,
} from '../interfaces'

export class DateUtil {
  static format<T = Date | string>(date: Date | string, options?: IDateRequestOptions): T {
    const reqDate = new Date(date)
    if (options?.durationSet) {
      if (!options.durationSet?.hour) reqDate.setHours(0)
      if (!options.durationSet?.minute) reqDate.setMinutes(0)
      if (!options.durationSet?.second) reqDate.setSeconds(0)
      if (!options.durationSet?.millisecond) reqDate.setMilliseconds(0)
    }

    const mDate = this.create(reqDate, options)
    return (options?.format ? mDate.toFormat(options.format) : mDate.toJSDate()) as T
  }

  static create(date?: Date, options?: IDateCreateOptions): DateTime {
    const timezone = options?.timezone ?? AppContext.timezone()
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

  static getDate(date: Date | string, options?: IDateCreateOptions): Date {
    if (typeof date === 'string') {
      const [day, month, year] = date.split('/')
      date = `${year}-${month}-${day}`
    }

    return this.create(new Date(date), options).toJSDate()
  }

  static mergeDate(date: Date | string, duration: string): Date {
    if (typeof date === 'string') {
      const [day, month, year] = date.split('/')
      date = `${year}-${month}-${day}`
    }
    return this.create(new Date(date), { duration }).toJSDate()
  }

  static rangeDate(date: Date | string): IDateRange {
    const mDate = this.create(new Date(date))
    return {
      startOfDay: mDate.startOf('day').toJSDate(),
      endOfDay: mDate.endOf('day').toJSDate(),
      startOfMonth: mDate.startOf('month').toJSDate(),
      endOfMonth: mDate.endOf('month').toJSDate(),
      startOfYear: mDate.startOf('year').toJSDate(),
      endOfYear: mDate.endOf('year').toJSDate(),
    }
  }

  static extractDate(date: Date | string): IDateExtractData {
    const mDate = this.create(new Date(date))
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

  static nowDate(options?: Omit<IDateRequestOptions, 'format'>): Date {
    const reqDate = new Date()

    if (options?.durationSet) {
      if (!options.durationSet?.hour) reqDate.setHours(0)
      if (!options.durationSet?.minute) reqDate.setMinutes(0)
      if (!options.durationSet?.second) reqDate.setSeconds(0)
      if (!options.durationSet?.millisecond) reqDate.setMilliseconds(0)
    }
    return this.create(reqDate, options).toJSDate()
  }
}
