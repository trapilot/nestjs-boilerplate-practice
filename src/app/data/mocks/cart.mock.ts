import { Injectable } from '@nestjs/common'
import { EnumOrderSource, EnumPointAction, EnumPointSource, Prisma } from '@runtime/prisma-client'
import { HelperService, ScheduleMockupBase } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { CartService } from 'modules/cart'
import { MemberUtil } from 'modules/member'

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
    const products = await this.prisma.product.findMany({
      where: { stockQty: { gt: 0 } },
    })
    const members = await this.prisma.member.findMany({
      where: { cart: null },
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

      const pointBalance = this.randomNumber(10_000, 50_000, 1000)
      await this.prisma.member.update({
        where: { id: member.id },
        data: {
          pointBalance,
          updatedAt: issuedAt,
          points: {
            create: {
              source: EnumPointSource.SYSTEM,
              action: EnumPointAction.INITIAL,
              point: pointBalance,
              pointBalance: pointBalance,
              expiryDate: this.memberUtil.getPointExpirationDate(issuedAt),
              createdAt: issuedAt,
              updatedAt: issuedAt,
            },
          },
        },
      })
    }

    for (const member of members) {
      const productList = this.pickProducts(products)
      const cartItems: Prisma.CartItemUncheckedCreateWithoutCartInput[] = []
      for (const product of productList) {
        const quantity = this.randomNumber(1, 2)

        cartItems.push({
          productId: product.id,
          quantity: quantity,
          unitPrice: product.salePrice,
          unitPoint: product.salePoint,
          finalPrice: product.salePrice * quantity,
          finalPoint: product.salePoint * quantity,
          createdAt: member.updatedAt,
          updatedAt: member.updatedAt,
        })
      }

      const cart = await this.prisma.cart.create({
        data: {
          memberId: member.id,
          version: 1,
          createdAt: member.updatedAt,
          updatedAt: member.updatedAt,
          items: {
            createMany: {
              data: cartItems,
            },
          },
        },
      })

      try {
        await this.cartService.checkout(cart.id, {
          dateDebug: member.updatedAt,
          source: EnumOrderSource.SYSTEM,
          shipment: {
            address: 'home #01',
            phone: member.phone,
          },
        })
      } catch (err: unknown) {
        this.logger.error(err)
      }
    }

    return
  }

  async mockable(): Promise<boolean> {
    return await this.prisma.member.exists({  cart: null })
  }

  private pickProducts<T>(products: T[]): T[] {
    const shuffled = products.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, this.randomNumber(1, 2))
  }

  private randomNumber(min: number, max: number, step: number = 1): number {
    const range = Math.floor((max - min) / step) + 1
    const randomStep = Math.floor(Math.random() * range)
    return min + randomStep * step
  }
}
