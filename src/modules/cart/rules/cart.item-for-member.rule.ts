import { BadRequestException, HttpStatus } from '@nestjs/common'
import { IAppRule } from 'lib/nest-core'
import { TCartItem } from '../interfaces/cart.interface'
import { CartService } from '../services/cart.service'

export class CartItemForMemberRule implements IAppRule<TCartItem> {
  constructor(
    private readonly cartService: CartService,
    private readonly memberId: number,
  ) {}

  async validate(data: TCartItem): Promise<void> {
    const { product } = data

    if (product.hasLimitPerson) {
      const checkLimitQty = await this.cartService.checkSalePerPerson(this.memberId, product)
      if (!checkLimitQty) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `You already save ${product.sku} to limited, over ${product.salePerPerson}`,
        })
      }
    }
  }
}
