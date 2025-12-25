import { BadRequestException, HttpStatus } from '@nestjs/common'
import { ICartRule, TCartItem } from '../interfaces'
import { CartService } from '../services'

export class CartItemForMemberRule implements ICartRule {
  constructor(
    private readonly cartService: CartService,
    private readonly memberId: number,
    private readonly issuedAt: Date,
  ) {}

  async validate({ product, quantity }: TCartItem): Promise<void> {
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
