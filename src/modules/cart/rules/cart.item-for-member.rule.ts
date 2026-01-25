import { BadRequestException, HttpStatus } from '@nestjs/common'
import { IAppRule } from 'lib/nest-core'
import { TCartItem } from '../interfaces'
import { CartService } from '../services'

export class CartItemForMemberRule implements IAppRule<TCartItem> {
  constructor(
    private readonly cartService: CartService,
    private readonly memberId: number,
    private readonly issuedAt: Date,
  ) {}

  async validate(data: TCartItem): Promise<void> {
    const { product, quantity } = data
    if (product.salePoint) {
      const pointRequire = product.salePoint * quantity
      const checkPoint = await this.cartService.checkPointRequire(
        this.memberId,
        pointRequire,
        this.issuedAt,
      )
      if (!checkPoint) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'module.member.notEnoughPoint',
        })
      }
    }

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
