import { BinaryLike, BinaryToTextEncoding, HashOptions, KeyObject } from 'crypto'
import { DateObjectUnits } from 'luxon'
import { TransformOptions } from 'stream'
import { EnumAppLanguage, EnumDateFormat, EnumNumberCurrency } from '../enums'
import { EnumLike } from './app.interface'

export interface IArrayJoinOptions {
  delimiter: string
  allowEmpty?: boolean
}

export interface IArrayFindOptions<T> {
  field?: string
  value: T
}

export interface INumberRandomOptions {
  min: number
  max: number
  step?: number
}

export interface INumberFormatOptions {
  style: 'decimal' | 'percent' | 'currency'
  language?: EnumAppLanguage
  currency?: EnumNumberCurrency
  useGrouping?: boolean
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

export interface INumberReturnOptions extends Omit<INumberFormatOptions, 'style' | 'language'> {}

export type IStringParse =
  | 'id'
  | 'number'
  | 'string'
  | 'boolean'
  | 'datetime'
  | 'seconds'
  | 'miliseconds'

export interface IStringFormatOptions {
  format?: 'uppercase' | 'lowercase' | 'capitalize'
  length?: number
  ascii?: boolean
  spaceless?: boolean
  allowDigit?: boolean
  slices?: {
    delimiter: '-'
    parts: number[]
  }
}

export interface IStringParseOptions {
  parseAs: IStringParse
  errorAs?: any
}

export interface IStringParseEnumOptions<T> {
  enum: EnumLike<T>
  fallback: T
  format?: 'uppercase' | 'lowercase' | 'capitalize'
}

export interface IStringSplitOptions {
  delimiter: string
  maxSplit?: number
  allowEmpty?: boolean
}

export interface IStringCapitalizeOptions {
  splitWords?: boolean
}

export interface IStringPadZeroOptions {
  length: number
  prefix?: string
}

export interface IStringRandomOptions {
  upperCase?: boolean
  numeric?: boolean
  safe?: boolean
  prefix?: string
  suffix?: string
}

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
  baseDate: Date
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
  language?: EnumAppLanguage
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

export interface IEncryptionHashOptions extends HashOptions {
  algorithm: 'md5' | 'sha256'
  encoding?: BinaryToTextEncoding
}

export interface IEncryptionHmacOptions extends TransformOptions {
  algorithm: 'md5' | 'sha256'
  key: BinaryLike | KeyObject
  length?: number
}

export interface IEncryptionSignOptions {
  privateKey: string
  algorithm: 'RSA-SHA256' | 'SHA256'
  encoding: BinaryToTextEncoding
}

export interface IEncryptionVerifyOptions extends Pick<
  IEncryptionSignOptions,
  'algorithm' | 'encoding'
> {
  publicKey: string | KeyObject
  signature: string
}
