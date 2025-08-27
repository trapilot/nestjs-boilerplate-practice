import { BadRequestException } from '@nestjs/common'
import { ICartItemRule, TCartItem } from '../interfaces'

export class CartItemInStockRule implements ICartItemRule {
  constructor(private readonly newQty: number = 0) {}

  async validate({ quantity: oldQty, product }: TCartItem): Promise<void> {
    if (product.hasInventory) {
      const remainQty = product.stockQty - product.paidQty - product.unpaidQty
      const redeemQty = oldQty + this.newQty
      if (redeemQty > remainQty) {
        throw new BadRequestException(`Not enough stock for ${product.sku}`)
      }
    }
  }
}
