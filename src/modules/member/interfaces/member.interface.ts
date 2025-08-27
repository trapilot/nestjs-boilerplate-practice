import {
  ENUM_SLIP_TYPE,
  Member,
  MemberDeviceHistory,
  MemberPointHistory,
  MemberTierHistory,
  MemberTokenHistory,
  Prisma,
  Tier,
} from '@prisma/client'

export type TMemberMetadata = {
  messages: any[]
}

export type TMember = Member & {
  tier?: Tier
  deviceHistories?: MemberDeviceHistory[]
  tokenHistories?: MemberTokenHistory[]
  tierHistories?: MemberTierHistory[]
  pointHistories?: MemberPointHistory[]
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
  type: ENUM_SLIP_TYPE
  prefix?: string
}
