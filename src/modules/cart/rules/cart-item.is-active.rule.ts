import { BadRequestException } from '@nestjs/common'
import { ICartItemRule, TCartItem } from '../interfaces'

export class CartItemIsActiveRule implements ICartItemRule {
  async validate({ product }: TCartItem): Promise<void> {
    if (!product.isActive) {
      throw new BadRequestException(`${product.sku} is no longer to sale`)
    }
  }
}
