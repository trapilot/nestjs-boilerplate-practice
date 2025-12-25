import { ENUM_TIER_CODE } from 'lib/nest-core'
import { InvoiceData } from 'modules/invoice/helpers'
import { MemberData } from 'modules/member/helpers'
import { TTier, TTierChart } from '../interfaces'
import { TierData, TierValue } from './tier.data'

export class TierChart {
  private readonly jumpOnFirstPurchase: boolean = true
  private infos: { [tierId: string]: TTier } = {}
  private charts: { [tierId: string]: TTierChart[] } = {}

  constructor(tiers: TTier[]) {
    const sortedTiers = tiers.sort((a, b) => a.level - b.level)

    for (const tier of sortedTiers) {
      const { charts, languages: _languages, ...data } = tier

      if (charts?.length) {
        this.infos[tier.id] = data

        const sortedCharts = charts.sort((a, b) => b.requireSpending - a.requireSpending)
        for (const chart of sortedCharts) {
          if (!(chart.currId in this.charts)) {
            this.charts[chart.currId] = []
          }
          this.charts[chart.currId].push(chart)
        }
      }
    }
  }

  getInfo(tierId: number): TTier {
    return this.infos[tierId]
  }

  getStats(tierId: number, originalId?: number): TierData {
    const tierIds = Object.keys(this.infos)
    const index = tierIds.indexOf(`${tierId}`)

    return new TierData(
      originalId ? this.infos[originalId] : this.infos[tierId],
      this.infos[tierIds[index - 1]] || this.infos[0],
      this.infos[tierId],
      this.infos[tierIds[index + 1]] || this.infos[tierIds.length - 1],
    )
  }

  getDataInFirstPurchase(
    tierId: number,
    tierMinId: number,
    oldSpending: number,
    newSpending: number = 0,
  ): { tierData: TierData; tierValue: TierValue } {
    if (this.jumpOnFirstPurchase === false) {
      return this.getData(tierId, tierMinId, oldSpending, newSpending)
    }

    const tierSpending = oldSpending + newSpending
    const charts = this.charts[tierId] || []
    for (const index in charts) {
      const chart = charts[index]
      if (chart.nextId === tierMinId || chart.requireSpending <= tierSpending) {
        const tierData = this.getStats(chart.nextId, tierId)
        return { tierData, tierValue: tierData.calculate(oldSpending, newSpending) }
      }
    }
    const tierData = this.getStats(tierId)
    return { tierData, tierValue: tierData.calculate(oldSpending, newSpending) }
  }

  getData(
    tierId: number,
    tierMinId: number,
    oldSpending: number,
    newSpending: number = 0,
  ): { tierData: TierData; tierValue: TierValue } {
    const tierSpending = oldSpending + newSpending
    const charts = this.charts[tierId] || []
    for (const index in charts) {
      const chart = charts[index]
      if (chart.isActive && (chart.nextId === tierMinId || chart.requireSpending <= tierSpending)) {
        const tierData = this.getStats(chart.nextId, tierId)
        return { tierData, tierValue: tierData.calculate(oldSpending, newSpending) }
      }
    }
    const tierData = this.getStats(tierId)
    return { tierData, tierValue: tierData.calculate(oldSpending, newSpending) }
  }

  calculateDataInFirstPurchase(
    memberData: MemberData,
    invoiceData: InvoiceData,
  ): { tierData: TierData; tierValue: TierValue; invoiceIds: number[] } {
    if (this.jumpOnFirstPurchase === false) {
      return this.calculateData(memberData, invoiceData)
    }

    const memberSpending = memberData.getRecentSpending()
    const totalSpending = memberSpending + invoiceData.totalAmount
    const charts = this.charts[memberData.tierId] || []

    for (const index in charts) {
      const chart = charts[index]
      if (chart.nextId === memberData.minTierId || chart.requireSpending <= totalSpending) {
        const tierData = this.getStats(chart.nextId, memberData.tierId)
        return {
          tierData,
          tierValue: tierData.calculate(memberSpending, invoiceData.totalAmount),
          invoiceIds: invoiceData.ids,
        }
      }
    }
    const tierData = this.getStats(memberData.tierId)
    return {
      tierData,
      tierValue: tierData.calculate(memberSpending, invoiceData.totalAmount),
      invoiceIds: invoiceData.ids,
    }
  }

  calculateData(
    memberData: MemberData,
    invoiceData: InvoiceData,
  ): { tierData: TierData; tierValue: TierValue; invoiceIds: number[] } {
    const memberSpending = memberData.getRecentSpending()
    const totalSpending = memberSpending + invoiceData.totalAmount
    const charts = this.charts[memberData.tierId] || []

    for (const index in charts) {
      const chart = charts[index]
      if (
        chart.isActive &&
        (chart.nextId === memberData.minTierId || chart.requireSpending <= totalSpending)
      ) {
        const tierData = this.getStats(chart.nextId, memberData.tierId)
        return {
          tierData,
          tierValue: tierData.calculate(memberSpending, invoiceData.totalAmount),
          invoiceIds: invoiceData.ids,
        }
      }
    }
    const tierData = this.getStats(memberData.tierId)
    return {
      tierData,
      tierValue: tierData.calculate(memberSpending, invoiceData.totalAmount),
      invoiceIds: invoiceData.ids,
    }
  }

  getNormalTier(): TTier {
    for (const tierId in this.infos) {
      if (this.infos[tierId].code === ENUM_TIER_CODE.NORMAL) {
        return this.infos[tierId]
      }
    }
    return this.infos[Object.keys(this.charts)[0]]
  }

  getStaffTier(): TTier {
    /*
    for (const tierId in this.infos) {
      if (this.infos[tierId].code === ENUM_TIER_CODE.BLUE) {
        return this.infos[tierId]
      }
    }
    */
    return this.infos[Object.keys(this.charts)[0]]
  }
}
