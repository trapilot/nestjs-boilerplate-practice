import { ENUM_DATE_FORMAT, ENUM_MESSAGE_LANGUAGE } from '../enums'

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
  startOfDay?: boolean
  endOfDay?: boolean
  duration?: string
  timezone?: string
}

export interface IDateRequestOptions extends IDateCreateOptions {
  default?: any
  format?: ENUM_DATE_FORMAT
  durationSet?: {
    hour?: boolean
    minute?: boolean
    second?: boolean
    millisecond?: boolean
  }
  relativeDaysFromNow?: number
}

export interface IDateFriendlyOptions {
  days: number
  language?: ENUM_MESSAGE_LANGUAGE
  format?: ENUM_DATE_FORMAT | string
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
