import { Injectable } from '@nestjs/common'
import { EnumCartStatus, EnumOrderSource } from '@runtime/prisma-client'
import { ScheduleMockupBase } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { OrderService } from 'modules/order/services/order.service'

@Injectable()
export class OrderMock extends ScheduleMockupBase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderService: OrderService,
  ) {
    super()
  }

  async mockup(): Promise<void> {
    const carts = await this.prisma.cart.findMany({
      where: { status: EnumCartStatus.SAVED },
      select: {
        id: true,
        version: true,
        updatedAt: true,
        member: {
          select: {
            id: true,
            phone: true,
            address: true,
          },
        },
      },
      take: 100,
    })

    for (const cart of carts) {
      try {
        await this.orderService.createFromCart(cart.id, {
          issuedAt: cart.updatedAt,
          source: EnumOrderSource.SYSTEM,
          shipment: {
            address: cart.member.address,
            phone: cart.member.phone,
          },
        })
      } catch (err: unknown) {
        this.logger.error(err)
      }
    }

    return
  }
}
