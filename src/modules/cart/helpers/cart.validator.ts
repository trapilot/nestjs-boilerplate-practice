import { ICartItemRule, TCartItem } from '../interfaces'

export class CartValidator {
  private rules: ICartItemRule[] = []

  constructor(rules: ICartItemRule[]) {
    this.rules = rules
  }

  addRule(rule: ICartItemRule): void {
    this.rules.push(rule)
  }

  async validate(cartItem: TCartItem): Promise<void> {
    for (const rule of this.rules) {
      await rule.validate(cartItem)
    }
  }
}
