import { BadRequestException } from '@nestjs/common'
import { ICartRule, TCartItem } from '../interfaces'

export class CartItemIsActiveRule implements ICartRule {
  async validate({ product }: TCartItem): Promise<void> {
    if (!product.isActive) {
      throw new BadRequestException(`${product.sku} is no longer to sale`)
    }
  }
}
