import { Injectable } from '@nestjs/common'
import { EnumCartStatus } from '@runtime/prisma-client'
import { HelperService, ScheduleMockupBase } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { CartService } from 'modules/cart/services/cart.service'

@Injectable()
export class CartMock extends ScheduleMockupBase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly cartService: CartService,
  ) {
    super()
  }

  async mockup(): Promise<void> {
    const nowDate = this.helperService.dateNow()

    const products = await this.prisma.product.findMany({
      where: { stockQty: { gt: 0 } },
    })
    const members = await this.prisma.member.findMany({
      where: {
        pointBalance: { gt: 0 },
        points: {
          some: {
            point: { gt: 0 },
            OR: [{ expiryDate: null }, { expiryDate: { gte: nowDate } }],
          },
        },
        carts: { none: { status: { in: [EnumCartStatus.ACTIVE, EnumCartStatus.SAVED] } } },
      },
      select: { id: true, birthMonth: true, phone: true, updatedAt: true },
      take: 100,
      orderBy: [{ updatedAt: 'asc' }],
    })

    for (const member of members) {
      try {
        const cart = await this.cartService.getOrCreateActiveCart(member.id)

        const productList = this.pickProducts(products)
        for (const product of productList) {
          const quantity = this.helperService.randomNumber({ min: 1, max: 2 })

          await this.cartService.addItem(cart.memberId, {
            productId: product.id,
            quantity: quantity,
          })
        }
      } catch (err: unknown) {
        console.log({ err })
      }
    }

    return
  }

  private pickProducts<T>(products: T[]): T[] {
    const shuffled = products.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, this.helperService.randomNumber({ min: 1, max: 4 }))
  }
}
