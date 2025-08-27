import { faker } from '@faker-js/faker'
import { Logger } from '@nestjs/common'
import { ENUM_ORDER_SOURCE, ENUM_POINT_TYPE, Prisma } from '@prisma/client'
import { HelperDateService, NEST_CLI, NestHelper } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command, CommandRunner } from 'nest-commander'
import { MemberService } from 'src/modules/member/services'
import { CartService } from '../services'

@Command({
  name: 'cart:seed',
  description: 'Seed carts',
})
export class CartSeedCommand extends CommandRunner {
  private readonly logger = new Logger(NEST_CLI)

  constructor(
    private readonly prisma: PrismaService,
    private readonly memberService: MemberService,
    private readonly cartService: CartService,
    private readonly helperDateService: HelperDateService,
  ) {
    super()
  }

  async run(passedParam: string[], options?: any): Promise<void> {
    this.logger.warn(`${CartSeedCommand.name} is running...`)

    try {
      await this.prisma.$queryRaw`SET FOREIGN_KEY_CHECKS=0`
      await this.prisma.$queryRawUnsafe(`TRUNCATE TABLE carts`)
      await this.prisma.$queryRawUnsafe(`TRUNCATE TABLE cart_items`)
      await this.prisma.$queryRawUnsafe(`TRUNCATE TABLE member_point_histories`)
      await this.prisma.$queryRaw`SET FOREIGN_KEY_CHECKS=1`

      const dateNow = this.helperDateService.create()
      const issuedAt = this.helperDateService.backward(dateNow, { day: 1 })

      const members = await this.prisma.member.findMany({
        select: { id: true, birthMonth: true, phone: true },
      })
      const products = await this.prisma.product.findMany()

      for (const member of members) {
        const pointBalance = NestHelper.randomNumber(2_000, 20_000, 500)
        await this.prisma.member.update({
          where: { id: member.id },
          data: {
            pointBalance,
            updatedAt: issuedAt,
            pointHistories: {
              create: {
                type: ENUM_POINT_TYPE.SYSTEM,
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
        try {
          const productList = NestHelper.randomItems(products, NestHelper.randomNumber(1, 2))

          const cartItems: Prisma.CartItemUncheckedCreateWithoutCartInput[] = []
          for (const product of productList) {
            const quantity = NestHelper.randomNumber(1, 2)

            cartItems.push({
              productId: product.id,
              quantity: quantity,
              unitPrice: product.salePrice,
              unitPoint: product.salePoint,
              finalPrice: product.salePrice * quantity,
              finalPoint: product.salePoint * quantity,
              createdAt: issuedAt,
              updatedAt: issuedAt,
            })
          }

          const cart = await this.prisma.cart.create({
            data: {
              memberId: member.id,
              version: 1,
              createdAt: issuedAt,
              updatedAt: issuedAt,
              items: {
                createMany: {
                  data: cartItems,
                },
              },
            },
          })
          await this.cartService.checkout(cart.id, {
            dateDebug: issuedAt,
            source: ENUM_ORDER_SOURCE.SYSTEM,
            shipment: {
              address: faker.location.streetAddress(true),
              phone: member.phone,
            },
          })
        } catch (err: any) {
          console.log(err.message)
        }
      }
    } catch (err: any) {
      throw new Error(err.message)
    }

    return
  }
}
