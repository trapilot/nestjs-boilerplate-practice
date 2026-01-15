import { DateObjectUnits } from 'luxon'
import { EnumDateFormat, EnumMessageLanguage } from '../enums'

export interface IDateExtractData {
  date: Date
  second: number
  minute: number
  hour: number
  weekday: number
  day: number
  month: number
  year: number
}

export interface IDateCheckOptions {
  perYear?: boolean
  inYear?: boolean
  inMonth?: boolean
  inDay?: boolean
}

export interface IDateCompareOptions {
  startOfDay?: boolean
  endOfDay?: boolean
  sinceDate?: Date
}

export interface IDateCreateOptions {
  timezone?: string
  startOfDay?: boolean
  endOfDay?: boolean
  durationSet?: DateObjectUnits
}

export interface IDateFormatOptions extends IDateCreateOptions {
  default?: any
  format?: EnumDateFormat
  relativeDaysFromNow?: number
}

export interface IDateFriendlyOptions {
  days: number
  language?: EnumMessageLanguage
  format?: EnumDateFormat | string
}

export interface IDateRoundDownOptions {
  hour: boolean
  minute: boolean
  second: boolean
  millisecond: boolean
}

export interface IDateRange {
  startOfDay: Date
  endOfDay: Date
  startOfMonth: Date
  endOfMonth: Date
  startOfYear: Date
  endOfYear: Date
}
