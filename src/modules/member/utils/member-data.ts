import { Member, MemberTierHistory, Prisma } from '@prisma/client'

export class MemberData {
  public readonly id: number
  public tierId: number
  public minTierId: number
  public orgTierId: number
  public isActive: boolean
  public updatedAt: Date | string
  public expiryDate: Date | string
  public pointBalance: number
  public maximumSpending: number
  public personalSpending: number
  public referralSpending: number

  public hasFirstPurchased: boolean
  public hasFirstPurchasedAt: Date | string

  public hasBirthPurchased: boolean
  public hasBirthPurchasedAt: Date | string

  public hasDiamondAchieved: boolean
  public hasDiamondAchievedAt: Date | string

  // Referee (Friend): a person who is invited to a referral/ referred by another
  // Referrer (Brand Advocate/ Ambassador): a person who makes a referral/refers another
  private referrer: MemberData = null
  private isReferrer: boolean = false

  public orgTierHistory: {
    id: number
    data: Prisma.MemberTierHistoryUncheckedCreateWithoutMemberInput
  }
  public tierHistories: Prisma.MemberTierHistoryUncheckedCreateWithoutMemberInput[] = []
  public pointHistories: Prisma.MemberPointHistoryUncheckedCreateWithoutMemberInput[] = []

  constructor(member: Member, tierHistory: MemberTierHistory) {
    this.id = member.id
    this.minTierId = member.minTierId
    this.orgTierId = member.tierId
    this.tierId = member.tierId
    this.isActive = member.isActive
    this.updatedAt = member.updatedAt
    this.expiryDate = member.expiryDate
    this.pointBalance = member.pointBalance
    this.maximumSpending = member.maximumSpending
    this.personalSpending = member.personalSpending
    this.referralSpending = member.referralSpending

    this.hasFirstPurchased = member.hasFirstPurchased
    this.hasFirstPurchasedAt = member.hasFirstPurchasedAt

    this.hasBirthPurchased = member.hasBirthPurchased
    this.hasBirthPurchasedAt = member.hasBirthPurchasedAt

    this.hasDiamondAchieved = member.hasDiamondAchieved
    this.hasDiamondAchievedAt = member.hasDiamondAchievedAt

    const { id, memberId, ...data } = tierHistory
    this.orgTierHistory = { id, data }
  }

  static make(member: Member, tierHistory: MemberTierHistory): MemberData {
    return new MemberData(member, tierHistory)
  }

  /*
  addTierHistoryAmount(amount: number, updatedAt: Date): MemberData {
    const orgTierHistory = this.getCurrTierData()
    if (orgTierHistory) {
      orgTierHistory.updatedAt = updatedAt

      this.tierId = orgTierHistory.currTierId
      this.minTierId = orgTierHistory.minTierId
      this.updatedAt = orgTierHistory.updatedAt

      const { remainPersonalSpending, remainReferralSpending } = orgTierHistory
      if (this.isReferrer) {
        orgTierHistory.referralSpending += amount
        orgTierHistory.remainReferralSpending -= Math.min(remainReferralSpending, amount)
      } else {
        orgTierHistory.personalSpending += amount
        orgTierHistory.remainPersonalSpending -= Math.min(remainPersonalSpending, amount)
      }
    }
    return this
  }
  */

  private isMemberTierHistoryUpdate(
    tierHistory:
      | Prisma.MemberTierHistoryUncheckedCreateWithoutMemberInput
      | Prisma.MemberTierHistoryUncheckedUpdateWithoutMemberInput,
  ): tierHistory is Prisma.MemberTierHistoryUncheckedUpdateWithoutMemberInput {
    return 'id' in tierHistory && !!tierHistory.id
  }

  private isMemberTierHistoryCreate(
    tierHistory:
      | Prisma.MemberTierHistoryUncheckedCreateWithoutMemberInput
      | Prisma.MemberTierHistoryUncheckedUpdateWithoutMemberInput,
  ): tierHistory is Prisma.MemberTierHistoryUncheckedCreateWithoutMemberInput {
    return !this.isMemberTierHistoryUpdate(tierHistory)
  }

  addTierHistory(
    tierHistory:
      | Prisma.MemberTierHistoryUncheckedCreateWithoutMemberInput
      | Prisma.MemberTierHistoryUncheckedUpdateWithoutMemberInput,
  ): MemberData {
    if (this.isMemberTierHistoryUpdate(tierHistory)) {
      const { personalSpending, referralSpending } = tierHistory
      if (this.isReferrer) {
        this.referralSpending += +referralSpending
        this.orgTierHistory.data.referralSpending += +referralSpending
      } else {
        this.personalSpending += +personalSpending
        this.orgTierHistory.data.personalSpending += +personalSpending
      }
    }

    if (this.isMemberTierHistoryCreate(tierHistory)) {
      this.tierId = tierHistory.currTierId
      this.expiryDate = tierHistory.expiryDate
      this.maximumSpending = tierHistory.upgradeSpending

      if (tierHistory?.minTierId) {
        this.minTierId = tierHistory.minTierId
      } else {
        tierHistory.minTierId = this.minTierId
      }

      if (this.isReferrer) {
        this.referralSpending = +tierHistory.referralSpending
      } else {
        this.personalSpending = +tierHistory.personalSpending
      }

      if (this.orgTierHistory.data.isActive) {
        this.orgTierHistory.data.isActive = false
        this.orgTierHistory.data.isDeleted = true
      }

      this.tierHistories.push(tierHistory)
    }

    return this
  }

  addPointHistory(
    pointHistory: Prisma.MemberPointHistoryUncheckedCreateWithoutMemberInput,
  ): MemberData {
    if (pointHistory && pointHistory.point !== 0) {
      this.pointBalance += pointHistory.point
      pointHistory.pointBalance = this.pointBalance

      // const { memberId, ...data } = pointHistory
      this.pointHistories.push(pointHistory)
    }
    return this
  }

  setIsReferrer(flag: boolean = false) {
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

  setFirstPurchased() {
    this.hasFirstPurchased = true
    return this
  }

  setBirthPurchased(flag: boolean = true) {
    this.hasBirthPurchased = flag
    return this
  }

  setDiamondAchieved(flag: boolean = true) {
    this.hasDiamondAchieved ||= flag
    return this
  }

  getCurrTierData() {
    return this.tierHistories.find((o) => o?.id)
  }

  isLimitedTier(tierId: number): boolean {
    return tierId === this.minTierId
  }

  getRecentSpending() {
    const recentData = this.getRecentTierData()
    if (recentData) {
      return this.isReferrer ? recentData.referralSpending : recentData.personalSpending
    }
    return 0
  }

  getRecentTierData() {
    if (this.tierHistories.length) {
      return this.tierHistories[this.tierHistories.length - 1]
    }
    return this.orgTierHistory.data
  }

  getRecentPointData() {
    return this.pointHistories[this.pointHistories.length - 1] || null
  }
}
