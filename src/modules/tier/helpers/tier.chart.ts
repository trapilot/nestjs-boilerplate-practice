import { EnumTierCode } from 'lib/nest-core'
import { InvoiceData } from 'modules/invoice'
import { MemberData } from 'modules/member'
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

        const sortedCharts = charts.sort((a, b) => b.requireAmount - a.requireAmount)
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
    oldAmount: number,
    newAmount: number = 0,
  ): { tierData: TierData; tierValue: TierValue } {
    if (this.jumpOnFirstPurchase === false) {
      return this.getData(tierId, tierMinId, oldAmount, newAmount)
    }

    const tierAmount = oldAmount + newAmount
    const charts = this.charts[tierId] || []
    for (const index in charts) {
      const chart = charts[index]
      if (chart.nextId === tierMinId || chart.requireAmount <= tierAmount) {
        const tierData = this.getStats(chart.nextId, tierId)
        return { tierData, tierValue: tierData.calculate(oldAmount, newAmount) }
      }
    }
    const tierData = this.getStats(tierId)
    return { tierData, tierValue: tierData.calculate(oldAmount, newAmount) }
  }

  getData(
    tierId: number,
    tierMinId: number,
    oldAmount: number,
    newAmount: number = 0,
  ): { tierData: TierData; tierValue: TierValue } {
    const tierAmount = oldAmount + newAmount
    const charts = this.charts[tierId] || []
    for (const index in charts) {
      const chart = charts[index]
      if (chart.isActive && (chart.nextId === tierMinId || chart.requireAmount <= tierAmount)) {
        const tierData = this.getStats(chart.nextId, tierId)
        return { tierData, tierValue: tierData.calculate(oldAmount, newAmount) }
      }
    }
    const tierData = this.getStats(tierId)
    return { tierData, tierValue: tierData.calculate(oldAmount, newAmount) }
  }

  calculateDataInFirstPurchase(
    memberData: MemberData,
    invoiceData: InvoiceData,
  ): { tierData: TierData; tierValue: TierValue; invoiceIds: number[] } {
    if (this.jumpOnFirstPurchase === false) {
      return this.calculateData(memberData, invoiceData)
    }

    const memberAmount = memberData.getRecentAmount()
    const totalAmount = memberAmount + invoiceData.totalAmount
    const charts = this.charts[memberData.tierId] || []

    for (const index in charts) {
      const chart = charts[index]
      if (chart.nextId === memberData.minTierId || chart.requireAmount <= totalAmount) {
        const tierData = this.getStats(chart.nextId, memberData.tierId)
        return {
          tierData,
          tierValue: tierData.calculate(memberAmount, invoiceData.totalAmount),
          invoiceIds: invoiceData.ids,
        }
      }
    }
    const tierData = this.getStats(memberData.tierId)
    return {
      tierData,
      tierValue: tierData.calculate(memberAmount, invoiceData.totalAmount),
      invoiceIds: invoiceData.ids,
    }
  }

  calculateData(
    memberData: MemberData,
    invoiceData: InvoiceData,
  ): { tierData: TierData; tierValue: TierValue; invoiceIds: number[] } {
    const memberAmount = memberData.getRecentAmount()
    const totalAmount = memberAmount + invoiceData.totalAmount
    const charts = this.charts[memberData.tierId] || []

    for (const index in charts) {
      const chart = charts[index]
      if (
        chart.isActive &&
        (chart.nextId === memberData.minTierId || chart.requireAmount <= totalAmount)
      ) {
        const tierData = this.getStats(chart.nextId, memberData.tierId)
        return {
          tierData,
          tierValue: tierData.calculate(memberAmount, invoiceData.totalAmount),
          invoiceIds: invoiceData.ids,
        }
      }
    }
    const tierData = this.getStats(memberData.tierId)
    return {
      tierData,
      tierValue: tierData.calculate(memberAmount, invoiceData.totalAmount),
      invoiceIds: invoiceData.ids,
    }
  }

  getNormalTier(): TTier {
    for (const tierId in this.infos) {
      if (this.infos[tierId].code === EnumTierCode.NORMAL) {
        return this.infos[tierId]
      }
    }
    return this.infos[Object.keys(this.charts)[0]]
  }

  getStaffTier(): TTier {
    /*
    for (const tierId in this.infos) {
      if (this.infos[tierId].code === EnumTierCode.BLUE) {
        return this.infos[tierId]
      }
    }
    */
    return this.infos[Object.keys(this.charts)[0]]
  }
}
