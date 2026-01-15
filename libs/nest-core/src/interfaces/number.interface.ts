import { EnumNumberCurrency, EnumMessageLanguage } from '../enums'

export interface INumberFormatOptions {
  style: 'decimal' | 'percent' | 'currency'
  language?: EnumMessageLanguage
  currency?: EnumNumberCurrency
  useGrouping?: boolean
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

export interface INumberReturnOptions extends Omit<INumberFormatOptions, 'style' | 'language'> {}
