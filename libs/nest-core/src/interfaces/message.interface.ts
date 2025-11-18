import { ValidationError } from '@nestjs/common'

export type IMessageProperties = Record<string, string | number | any>

export interface IMessageErrorOptions {
  readonly customLanguage?: string
  readonly validationError?: {
    [property: string]: ValidationError
  }
}

export interface IMessageSetOptions extends IMessageErrorOptions {
  readonly properties?: IMessageProperties
}
