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
  spaceless?: boolean
  allowDigit?: boolean
}

export interface IStringParseOptions {
  parseAs: IStringParse
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

export interface IStringRandomOptions {
  upperCase?: boolean
  numeric?: boolean
  safe?: boolean
  prefix?: string
  pattern?: RegExp
}
