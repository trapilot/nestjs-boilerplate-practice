import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { EnumOrderSource, EnumPointHistoryType, Prisma } from '@runtime/prisma-client'
import { EnumScopeType, HelperService, LoggerService, ScopeAsync, StrUtil } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { MemberService } from 'modules/member/services'
import { CartService } from '../services'

@Injectable()
export class CartMockTask {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly memberService: MemberService,
    private readonly cartService: CartService,
    private readonly helperService: HelperService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, {
    disabled: StrUtil.isNotTrue(process.env.AUTO_GEN_MODE),
  })
  @ScopeAsync(EnumScopeType.CRON, {
    context: 'cron.cart_mockup_items',
  })
  async mockup(): Promise<void> {
    this.logger.log(`${CartMockTask.name} is running`)
    const canRun = await this.canRun()
    if (!canRun) {
      this.logger.warn(`${CartMockTask.name} stopped`)
      return
    }

    const products = await this.prisma.product.findMany({
      where: { stockQty: { gt: 0 } },
    })
    const members = await this.prisma.member.findMany({
      where: { cart: null },
      select: { id: true, birthMonth: true, phone: true, updatedAt: true },
      take: 10,
      orderBy: [{ updatedAt: 'asc' }],
    })

    try {
      for (const member of members) {
        const issuedAt = this.helperService.dateForward(member.updatedAt, {
          days: faker.number.int({ min: 1, max: 5 }),
        })

        // hard update issue date
        member.updatedAt = issuedAt

        const pointBalance = this.randomNumber(2_000, 20_000, 500)
        await this.prisma.member.update({
          where: { id: member.id },
          data: {
            pointBalance,
            updatedAt: issuedAt,
            pointHistories: {
              create: {
                type: EnumPointHistoryType.SYSTEM,
                point: pointBalance,
                pointBalance: pointBalance,
                expiryDate: this.memberService.getPointExpirationDate(issuedAt),
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
              address: faker.location.streetAddress(true),
              phone: member.phone,
            },
          })
        } catch (err: any) {}
      }
    } catch (err: any) {
      this.logger.error(err)
    } finally {
      this.logger.warn(`${CartMockTask.name} done`)
    }

    return
  }

  private async canRun(): Promise<boolean> {
    const memberNumbersWithoutCart = await this.prisma.member.count({
      where: { cart: null },
    })
    return memberNumbersWithoutCart > 0
  }

  private pickProducts(products: any[]) {
    const shuffled = products.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, this.randomNumber(1, 2))
  }

  private randomNumber(min: number, max: number, step: number = 1) {
    const range = Math.floor((max - min) / step) + 1
    const randomStep = Math.floor(Math.random() * range)
    return min + randomStep * step
  }
}
