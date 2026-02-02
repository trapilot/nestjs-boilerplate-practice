import { TTier } from '../interfaces/tier.interface'

export interface TierValue {
  currAmount: number
  usageAmount: number
  excessAmount: number
  totalAmount: number
}

export class TierData {
  info: TTier
  prev: TTier
  curr: TTier
  next: TTier

  constructor(info: TTier, prev: TTier, curr: TTier, next: TTier) {
    this.info = info
    this.prev = prev
    this.curr = curr
    this.next = next
  }

  isUpgrade(): boolean {
    return this.curr.level > this.info.level
  }

  isRenewal(): boolean {
    return this.curr.level === this.info.level
  }

  isDowngrade(): boolean {
    return this.curr.level < this.info.level
  }

  calculate(oldAmount: number, newAmount: number): TierValue {
    const limitAmount = this.isUpgrade() ? this.curr.limitAmount : this.next.limitAmount
    const totalAmount = oldAmount + newAmount
    const excessAmount = Math.max(0, totalAmount - limitAmount)
    const currAmount = this.curr.alive ? excessAmount : 0
    const usageAmount = newAmount - currAmount

    return { totalAmount, excessAmount, usageAmount, currAmount }
  }
}
