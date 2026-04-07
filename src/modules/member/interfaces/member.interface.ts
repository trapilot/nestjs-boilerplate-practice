import {
  EnumSlipType,
  EnumVerificationChannel,
  EnumVerificationMethod,
  Member,
  MemberDevice,
  MemberPoint,
  MemberSession,
  MemberTier,
  MemberTwoFactor,
  MemberVerification,
  Prisma,
  Tier,
} from '@runtime/prisma-client'
import { EnumSmsDriver, TypeLeastOne } from 'lib/nest-core'

export type TMemberVerification = MemberVerification

export type TMember = Member & {
  tier?: Tier
  twoFactor?: MemberTwoFactor
  devices?: MemberDevice[]
  sessions?: MemberSession[]
  tiers?: MemberTier[]
  points?: MemberPoint[]
  verifications?: MemberVerification[]
}

export type TMemberMetadata = {
  messages: string[]
}
export interface IMemberRecentData {
  id: number
  pointBalance: number
  tierId: number
  expiryDate: Date
  personalAmount: number
  referralAmount: number
  maximumAmount: number
  tiers: Prisma.MemberTierUncheckedCreateWithoutMemberInput[]
  points: Prisma.MemberPointUncheckedCreateWithoutMemberInput[]
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
  drivers: EnumSmsDriver[]
}

export interface IMemberVerifySendEOTPOptions extends IMemberVerifySendOptions {
  language?: string
}

export interface IMemberGrantTierRewardOptions {
  tierId: number
  issuedAt: Date
}

export interface IMemberGrantTierRewardPayload extends IMemberGrantTierRewardOptions {
  memberId: number
}

export interface IMemberGenerateCodePayload {
  memberId: number
  issuedAt: Date
}

export interface IMemberEmailWelcomePayload {
  memberId: number
  memberEmail: string
}

export interface IMemberEarnPurchasePayload {
  invoiceIds: number[]
  issuedAt: Date
}
