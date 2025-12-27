import {
  ENUM_VERIFICATION_CHANNEL,
  ENUM_VERIFICATION_TYPE,
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
  channel: ENUM_VERIFICATION_CHANNEL
  type: ENUM_VERIFICATION_TYPE
}

export interface IVerificationSendOptions {
  type: ENUM_VERIFICATION_TYPE
  subject: string
  text?: string
  template?: string
  language?: string
  properties?: Record<string, any>
}

export interface IVerificationVerifyOptions extends IVerificationRequestOptions {
  type: ENUM_VERIFICATION_TYPE
}
