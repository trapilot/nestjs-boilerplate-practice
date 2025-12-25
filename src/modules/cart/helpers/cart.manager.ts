import { ICartRule, TCartItem } from '../interfaces'

export class CartManager {
  private rules: ICartRule[] = []

  constructor(rules: ICartRule[]) {
    this.rules = rules
  }

  addRule(rule: ICartRule): void {
    this.rules.push(rule)
  }

  async validate(cartItem: TCartItem): Promise<void> {
    for (const rule of this.rules) {
      await rule.validate(cartItem)
    }
  }
}
