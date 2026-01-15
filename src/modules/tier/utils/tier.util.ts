import { TierValue } from '../helpers'
import { TTier } from '../interfaces'

export class TierUtil {
  static ratio(rate: number): number {
    if (rate <= 0) {
      throw new Error('Rate value is invalid!')
    }
    return 1 / rate
  }

  static convert(amount: number, rate: number): number {
    return TierUtil.round(amount / rate)
  }

  static round(amount: number): number {
    return Math.round(amount)
  }

  static parse(tier: TTier): {
    initialRate: number
    personalRate: number
    referralRate: number
    initialRatio: number
    personalRatio: number
    referralRatio: number
    birthdayRatio: number
  } {
    return {
      initialRate: tier.initialRate,
      personalRate: tier.personalRate,
      referralRate: tier.referralRate,
      initialRatio: TierUtil.ratio(tier.initialRate),
      personalRatio: TierUtil.ratio(tier.personalRate),
      referralRatio: TierUtil.ratio(tier.referralRate),
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
