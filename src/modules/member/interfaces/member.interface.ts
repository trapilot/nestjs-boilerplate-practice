import {
  EnumSlipType,
  EnumVerificationChannel,
  EnumVerificationMethod,
  Member,
  MemberDeviceHistory,
  MemberPointHistory,
  MemberTierHistory,
  MemberTokenHistory,
  MemberVerifyHistory,
  Prisma,
  Tier,
} from '@runtime/prisma-client'
import { EnumSmsDriver, TypeLeastOne } from 'lib/nest-core'

export type TMemberVerifyHistory = MemberVerifyHistory

export type TMember = Member & {
  tier?: Tier
  deviceHistories?: MemberDeviceHistory[]
  tokenHistories?: MemberTokenHistory[]
  tierHistories?: MemberTierHistory[]
  pointHistories?: MemberPointHistory[]
  verifyHistories?: TMemberVerifyHistory[]
}

export type TMemberMetadata = {
  messages: string[]
}
export interface IMemberRecentData {
  id: number
  pointBalance: number
  tierId: number
  expiryDate: Date
  personalSpending: number
  referralSpending: number
  maximumSpending: number
  tierHistories: Prisma.MemberTierHistoryUncheckedCreateWithoutMemberInput[]
  pointHistories: Prisma.MemberPointHistoryUncheckedCreateWithoutMemberInput[]
}

export interface IMemberData extends IMemberRecentData {
  referrerData?: IMemberRecentData
}

export interface ISlipCounterOptions {
  type: EnumSlipType
  prefix?: string
}

export interface IMemberVerifyIdentity {
  email: string
  phone: string
  memberId: number
}

export interface IMemberVerifyType {
  channel: EnumVerificationChannel
  method: EnumVerificationMethod
}

export interface IMemberVerifyCreateOptions {
  length: number
  seconds: number
  hashed?: boolean
  numeric?: boolean
  inspector?: boolean
}

export interface IMemberVerifyRandomOptions extends IMemberVerifyCreateOptions {
  method: EnumVerificationMethod
  maxAttempts: number
  memberData?: Partial<IMemberVerifyIdentity>
}

export type IMemberVerifyCheckOptions = IMemberVerifyType & Partial<IMemberVerifyIdentity>
export type IMemberVerifyApproveOptions = IMemberVerifyType & TypeLeastOne<IMemberVerifyIdentity>

export interface IMemberVerifySendOptions {
  method: EnumVerificationMethod
  subject: string
  language?: string
  template: {
    fileName: string
    messageProperties?: Record<string, number | string>
  }
}

export interface IMemberVerifySendPOTPOptions extends IMemberVerifySendOptions {
  dispatchers: EnumSmsDriver[]
}

export interface IMemberVerifySendEOTPOptions extends IMemberVerifySendOptions {
  language?: string
}
