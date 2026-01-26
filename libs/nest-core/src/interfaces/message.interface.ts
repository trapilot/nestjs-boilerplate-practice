import { ValidationError } from '@nestjs/common'
import { EnumAppLanguage } from '../enums'

export interface IMessageError {
  property: string
  message: string
}

export type IMessageRow<T> = { [K: string]: T } & { [language: string]: EnumAppLanguage }
export type IMessageField<T> = Partial<Record<EnumAppLanguage, T>>
export type IMessageAttributes<T> = Record<string, IMessageField<T>>
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
