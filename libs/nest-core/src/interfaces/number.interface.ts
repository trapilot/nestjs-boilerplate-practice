import { ENUM_MESSAGE_LANGUAGE, ENUM_NUMBER_CURRENCY } from '../enums'

export interface INumberFormatOptions {
  style: 'decimal' | 'percent' | 'currency'
  language?: ENUM_MESSAGE_LANGUAGE
  currency?: ENUM_NUMBER_CURRENCY
  useGrouping?: boolean
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

export interface INumberReturnOptions extends Omit<INumberFormatOptions, 'style' | 'language'> {}
