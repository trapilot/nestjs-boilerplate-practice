import { ValidationError } from '@nestjs/common'

export interface IMessageError {
  property: string
  message: string
}

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
