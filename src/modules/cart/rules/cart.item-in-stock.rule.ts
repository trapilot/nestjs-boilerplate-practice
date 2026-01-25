import { BadRequestException } from '@nestjs/common'
import { IAppRule } from 'lib/nest-core'
import { TCartItem } from '../interfaces'

export class CartItemInStockRule implements IAppRule<TCartItem> {
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
