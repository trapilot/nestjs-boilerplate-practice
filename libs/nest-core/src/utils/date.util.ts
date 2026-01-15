import { DateTime } from 'luxon'
import { ScopeContext } from '../helpers'
import { IDateCreateOptions, IDateExtractData, IDateFormatOptions, IDateRange } from '../interfaces'

export class DateUtil {
  static create(date: Date, options?: IDateCreateOptions): DateTime {
    const timezone = options?.timezone ?? ScopeContext.getReqZone()
    let mDate = DateTime.fromJSDate(date).setZone(timezone)

    if (options?.startOfDay) {
      mDate = mDate.startOf('day')
    } else if (options?.endOfDay) {
      mDate = mDate.endOf('day')
    } else if (options?.durationSet) {
      mDate = mDate.set(options.durationSet)
    }

    return mDate
  }

  static current(): DateTime {
    return DateTime.now().setZone(ScopeContext.getReqZone())
  }

  static format<T = Date | string>(date: Date | string, options?: IDateFormatOptions): T {
    const mDate = this.create(new Date(date), options)
    return (options?.format ? mDate.toFormat(options.format) : mDate.toJSDate()) as T
  }

  static getNow(): Date {
    return this.current().toJSDate()
  }

  static getDate(date: Date | string, options?: IDateCreateOptions): Date {
    if (typeof date === 'string') {
      const [day, month, year] = date.split('/')
      date = new Date(`${year}-${month}-${day}`)
    }
    return this.create(date, options).toJSDate()
  }

  static mergeDate(date: Date | string, duration: string): Date {
    if (typeof date === 'string') {
      const [day, month, year] = date.split('/')
      date = new Date(`${year}-${month}-${day}`)
    }
    const [hour, minute, second, millisecond] = duration.split(':').map(Number)

    return this.create(date, {
      durationSet: {
        hour,
        minute,
        second,
        millisecond,
      },
    }).toJSDate()
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
}
