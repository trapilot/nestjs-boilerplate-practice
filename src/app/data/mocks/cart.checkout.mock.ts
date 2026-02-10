import { Injectable } from '@nestjs/common'
import { EnumCartStatus } from '@runtime/prisma-client'
import { ScheduleMockupBase } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { CartService } from 'modules/cart/services/cart.service'

@Injectable()
export class CartCheckoutMock extends ScheduleMockupBase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) {
    super()
  }

  async mockup(): Promise<void> {
    const carts = await this.prisma.cart.findMany({
      where: { status: EnumCartStatus.ACTIVE },
      take: 10,
    })

    for (const cart of carts) {
      try {
        await this.cartService.checkout(cart.memberId, cart.version)
      } catch (err: unknown) {
        this.logger.error(err)
        await this.cartService.abandon(cart.id)
      }
    }

    return
  }
}
