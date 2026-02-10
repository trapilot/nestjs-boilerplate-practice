import { EnumPointReason, MemberPoint } from '@runtime/prisma-client'

export type TMemberPoint = MemberPoint

export interface IMemberPointApplyTierRewardOptions {
  memberId: number
  tierId: number
  issuedAt: Date
}

export interface IMemberPointHandleTriggerOptions {
  memberId: number
  tierId: number
  issuedAt: Date
  basePoint: number
  reason: EnumPointReason
  compareValue: number | string
}
