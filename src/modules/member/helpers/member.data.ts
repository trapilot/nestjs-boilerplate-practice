import { Member, MemberTier, Prisma } from '@runtime/prisma-client'

export class MemberData {
  public readonly id: number
  public tierId: number
  public minTierId: number
  public orgTierId: number
  public isActive: boolean
  public updatedAt: Date | string
  public expiryDate: Date | string
  public pointBalance: number
  public maximumAmount: number
  public personalAmount: number
  public referralAmount: number

  public hasFirstPurchased: boolean
  public hasFirstPurchasedAt: Date | string

  public hasBirthPurchased: boolean
  public hasBirthPurchasedAt: Date | string

  public hasFirstOfficial: boolean
  public hasFirstOfficialAt: Date | string

  // Referee (Friend): a person who is invited to a referral/ referred by another
  // Referrer (Brand Advocate/ Ambassador): a person who makes a referral/refers another
  private referrer: MemberData = null
  private isReferrer: boolean = false

  public orgMemberTier: {
    id: number
    data: Prisma.MemberTierUncheckedCreateWithoutMemberInput
  }
  public tiers: Prisma.MemberTierUncheckedCreateWithoutMemberInput[] = []
  public points: Prisma.MemberPointUncheckedCreateWithoutMemberInput[] = []

  constructor(member: Member, tierHistory: MemberTier) {
    this.id = member.id
    this.minTierId = member.minTierId
    this.orgTierId = member.tierId
    this.tierId = member.tierId
    this.isActive = member.isActive
    this.updatedAt = member.updatedAt
    this.expiryDate = member.expiryDate
    this.pointBalance = member.pointBalance
    this.personalAmount = member.personalAmount
    this.referralAmount = member.referralAmount

    this.hasFirstPurchased = member.hasFirstPurchased
    this.hasFirstPurchasedAt = member.hasFirstPurchasedAt

    this.hasBirthPurchased = member.hasBirthPurchased
    this.hasBirthPurchasedAt = member.hasBirthPurchasedAt

    this.hasFirstOfficial = member.hasFirstOfficial
    this.hasFirstOfficialAt = member.hasFirstOfficialAt

    const { id, memberId: _memberId, ...data } = tierHistory
    this.orgMemberTier = { id, data }
  }

  static make(member: Member, tierHistory: MemberTier): MemberData {
    return new MemberData(member, tierHistory)
  }

  /*
  addMemberTierAmount(amount: number, updatedAt: Date): MemberData {
    const orgMemberTier = this.getCurrTierData()
    if (orgMemberTier) {
      orgMemberTier.updatedAt = updatedAt

      this.tierId = orgMemberTier.currTierId
      this.minTierId = orgMemberTier.minTierId
      this.updatedAt = orgMemberTier.updatedAt

      const { remainPersonalAmount, remainReferralAmount } = orgMemberTier
      if (this.isReferrer) {
        orgMemberTier.referralAmount += amount
        orgMemberTier.remainReferralAmount -= Math.min(remainReferralAmount, amount)
      } else {
        orgMemberTier.personalAmount += amount
        orgMemberTier.remainPersonalAmount -= Math.min(remainPersonalAmount, amount)
      }
    }
    return this
  }
  */

  private isMemberTierUpdate(
    tierHistory:
      | Prisma.MemberTierUncheckedCreateWithoutMemberInput
      | Prisma.MemberTierUncheckedUpdateWithoutMemberInput,
  ): tierHistory is Prisma.MemberTierUncheckedUpdateWithoutMemberInput {
    return 'id' in tierHistory && !!tierHistory.id
  }

  private isMemberTierCreate(
    tierHistory:
      | Prisma.MemberTierUncheckedCreateWithoutMemberInput
      | Prisma.MemberTierUncheckedUpdateWithoutMemberInput,
  ): tierHistory is Prisma.MemberTierUncheckedCreateWithoutMemberInput {
    return !this.isMemberTierUpdate(tierHistory)
  }

  addMemberTier(
    tierHistory:
      | Prisma.MemberTierUncheckedCreateWithoutMemberInput
      | Prisma.MemberTierUncheckedUpdateWithoutMemberInput,
  ): MemberData {
    if (this.isMemberTierUpdate(tierHistory)) {
      const { personalAmount, referralAmount } = tierHistory
      if (this.isReferrer) {
        this.referralAmount += +referralAmount
        this.orgMemberTier.data.referralAmount += +referralAmount
      } else {
        this.personalAmount += +personalAmount
        this.orgMemberTier.data.personalAmount += +personalAmount
      }
    }

    if (this.isMemberTierCreate(tierHistory)) {
      this.tierId = tierHistory.tierId
      this.expiryDate = tierHistory.expiryDate

      if (this.isReferrer) {
        this.referralAmount = +tierHistory.referralAmount
      } else {
        this.personalAmount = +tierHistory.personalAmount
      }

      if (this.orgMemberTier.data.isActive) {
        this.orgMemberTier.data.isActive = false
      }

      this.tiers.push(tierHistory)
    }

    return this
  }

  addMemberPoint(pointHistory: Prisma.MemberPointUncheckedCreateWithoutMemberInput): MemberData {
    if (pointHistory && pointHistory.point !== 0) {
      this.pointBalance += pointHistory.point
      pointHistory.pointBalance = this.pointBalance

      // const { memberId, ...data } = pointHistory
      this.points.push(pointHistory)
    }
    return this
  }

  setIsReferrer(flag: boolean = false): MemberData {
    this.isReferrer = flag
    return this
  }

  hasReferrer(): boolean {
    return !!this.referrer
  }

  getReferrerData(): MemberData {
    if (this.hasReferrer()) {
      return this.referrer
    }
    return null
  }

  setReferrerData(refererData: MemberData): MemberData {
    if (refererData) {
      this.referrer = refererData
    }
    return this
  }

  addRefereeData(refereeData: MemberData): MemberData {
    if (refereeData) {
      refereeData.setReferrerData(this)
    }
    return this
  }

  setFirstPurchased(): MemberData {
    this.hasFirstPurchased = true
    return this
  }

  setBirthPurchased(flag: boolean = true): MemberData {
    this.hasBirthPurchased = flag
    return this
  }

  setDiamondAchieved(flag: boolean = true): MemberData {
    this.hasFirstOfficial ||= flag
    return this
  }

  getCurrTierData(): Prisma.MemberTierUncheckedCreateWithoutMemberInput {
    return this.tiers.find(o => o?.id)
  }

  isLimitedTier(tierId: number): boolean {
    return tierId === this.minTierId
  }

  getRecentAmount(): number {
    const recentData = this.getRecentTierData()
    if (recentData) {
      return this.isReferrer ? recentData.referralAmount : recentData.personalAmount
    }
    return 0
  }

  getRecentTierData(): Prisma.MemberTierUncheckedCreateWithoutMemberInput {
    if (this.tiers.length) {
      return this.tiers[this.tiers.length - 1]
    }
    return this.orgMemberTier.data
  }

  getRecentPointData(): Prisma.MemberPointUncheckedCreateWithoutMemberInput {
    return this.points[this.points.length - 1] || null
  }
}
