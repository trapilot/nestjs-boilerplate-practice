import { Injectable } from '@nestjs/common'
import { EnumCartStatus, EnumPointAction, EnumPointSource } from '@runtime/prisma-client'
import { HelperService, ScheduleMockupBase } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { CartService } from 'modules/cart/services/cart.service'
import { MemberUtil } from 'modules/member/helpers/member.util'

@Injectable()
export class CartMock extends ScheduleMockupBase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly cartService: CartService,
    private readonly memberUtil: MemberUtil,
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
        points: { some: { point: { gt: 0 }, expiryDate: { gte: nowDate } } },
        carts: { none: { status: { in: [EnumCartStatus.ACTIVE, EnumCartStatus.SAVED] } } }
      },
      select: { id: true, birthMonth: true, phone: true, updatedAt: true },
      take: 500,
      orderBy: [{ updatedAt: 'asc' }],
    })

    for (const member of members) {
      const issuedAt = this.helperService.dateForward(member.updatedAt, {
        days: this.helperService.randomNumber({ min: 1, max: 2 }),
      })

      // hard update issue date
      member.updatedAt = issuedAt

      const randomPoint = this.helperService.randomNumber({ min: 50_000, max: 500_000, step: 10_000 })
      await this.prisma.member.update({
        where: { id: member.id },
        data: {
          pointBalance: { increment: randomPoint},
          updatedAt: issuedAt,
          points: {
            create: {
              source: EnumPointSource.SYSTEM,
              action: EnumPointAction.ADJUST,
              point: randomPoint,
              expiryDate: this.memberUtil.getPointExpirationDate(issuedAt),
              createdAt: issuedAt,
              updatedAt: issuedAt,
            },
          },
        },
      })
    }

    for (const member of members) {
      try {
        const cart = await this.cartService.getOrCreateActiveCart(member.id)

        const productList = this.pickProducts(products)
        for (const product of productList) {
          const quantity = this.helperService.randomNumber({ min: 1, max: 2})

          await this.cartService.addItem(cart.memberId, {
            productId: product.id,
            quantity: quantity,
          })
        }
      } catch {}
    }

    return
  }

  private pickProducts<T>(products: T[]): T[] {
    const shuffled = products.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, this.helperService.randomNumber({ min: 1, max: 4 }))
  }
}
