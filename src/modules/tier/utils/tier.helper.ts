import { TTier } from '../interfaces'
import { TierValue } from './tier.data'

export class TierHelper {
  static ratio(rate: number) {
    if (rate <= 0) {
      throw new Error('Rate value is invalid!')
    }
    return 1 / rate
  }

  static convert(amount: number, rate: number) {
    return TierHelper.round(amount / rate)
  }

  static round(amount: number) {
    return Math.round(amount)
  }

  static parse(tier: TTier) {
    return {
      initialRate: tier.initialRate,
      personalRate: tier.personalRate,
      referralRate: tier.referralRate,
      initialRatio: TierHelper.ratio(tier.initialRate),
      personalRatio: TierHelper.ratio(tier.personalRate),
      referralRatio: TierHelper.ratio(tier.referralRate),
      birthdayRatio: tier.birthdayRatio,
    }
  }

  static calculate(tier: TTier, oldAmount: number, newAmount: number): TierValue {
    const totalAmount = oldAmount + newAmount
    const excessAmount = totalAmount - tier.limitSpending
    const usageAmount = newAmount - excessAmount
    const currAmount = tier.alive ? excessAmount : 0

    return { totalAmount, excessAmount, usageAmount, currAmount }
  }
}
