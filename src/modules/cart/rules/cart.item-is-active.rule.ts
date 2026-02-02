import { BadRequestException } from '@nestjs/common'
import { IAppRule } from 'lib/nest-core'
import { TCartItem } from '../interfaces/cart.interface'

export class CartItemIsActiveRule implements IAppRule<TCartItem> {
  async validate({ product }: TCartItem): Promise<void> {
    if (!product.isActive) {
      throw new BadRequestException(`${product.sku} is no longer to sale`)
    }
  }
}
