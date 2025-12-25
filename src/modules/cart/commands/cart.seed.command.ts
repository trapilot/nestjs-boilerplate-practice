import { faker } from '@faker-js/faker'
import { Logger } from '@nestjs/common'
import { ENUM_ORDER_SOURCE, ENUM_POINT_TYPE, Prisma } from '@prisma/client'
import { DateService, NEST_CLI } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { MemberService } from 'modules/member/services'
import { Command, CommandRunner } from 'nest-commander'
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
    private readonly dateService: DateService,
  ) {
    super()
  }

  async run(_passedParam: string[], _options?: any): Promise<void> {
    this.logger.warn(`${CartSeedCommand.name} is running...`)

    try {
      await this.prisma.$queryRaw`SET FOREIGN_KEY_CHECKS=0`
      await this.prisma.$queryRawUnsafe(`TRUNCATE TABLE carts`)
      await this.prisma.$queryRawUnsafe(`TRUNCATE TABLE cart_items`)
      await this.prisma.$queryRawUnsafe(`TRUNCATE TABLE member_point_histories`)
      await this.prisma.$queryRaw`SET FOREIGN_KEY_CHECKS=1`

      const dateNow = this.dateService.create()
      const issuedAt = this.dateService.backward(dateNow, { day: 1 })

      const members = await this.prisma.member.findMany({
        select: { id: true, birthMonth: true, phone: true },
      })
      const products = await this.prisma.product.findMany()

      for (const member of members) {
        const pointBalance = this.randomNumber(2_000, 20_000, 500)
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
