import { ENUM_MESSAGE_LANGUAGE } from '../enums'

export type IStringParse = 'id' | 'number' | 'string' | 'boolean' | 'datetime'

export interface IStringParseOptions {
  parseAs?: IStringParse
  errorAs?: any
}

export interface IStringSplitOptions {
  delimiter: string
  maxSplit?: number
  allowEmpty?: boolean
}

export interface IStringCapitalizeOptions {
  splitWords?: boolean
}

export interface IStringCurrencyOptions {
  baseLanguage?: string | ENUM_MESSAGE_LANGUAGE
  language?: string | ENUM_MESSAGE_LANGUAGE
  useGrouping?: boolean
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

export interface IStringNumericOptions extends IStringCurrencyOptions {}

export interface IStringEmailValidation {
  validated: boolean
  message: string
}

export interface IStringPasswordOptions {
  minLength?: number
  maxLength?: number
  minLowercase?: number
  minNumbers?: number
  minSymbols?: number
  minUppercase?: number
}

export interface IStringRandomOptions {
  upperCase?: boolean
  numeric?: boolean
  safe?: boolean
  prefix?: string
  pattern?: RegExp
}
