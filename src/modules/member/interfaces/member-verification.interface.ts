import {
  EnumVerificationChannel,
  EnumVerificationMethod,
  MemberVerifyHistory,
} from '@runtime/prisma-client'

export type TMemberVerifyHistory = MemberVerifyHistory

export interface IVerificationCodeData {
  code: string
  expired: Date
}

export interface IVerificationRequestOptions {
  email?: string
  phone?: string
  memberId?: number
}

export interface IVerificationRandomOptions {
  code?: string
  numeric?: boolean
  inspector?: boolean
  seconds: number
  length: number
}

export interface IVerificationCreateOptions extends IVerificationRequestOptions {
  channel: EnumVerificationChannel
  type: EnumVerificationMethod
}

export interface IVerificationSendOptions {
  type: EnumVerificationMethod
  subject: string
  text?: string
  template?: string
  language?: string
  properties?: Record<string, any>
}

export interface IVerificationVerifyOptions extends IVerificationRequestOptions {
  type: EnumVerificationMethod
}
