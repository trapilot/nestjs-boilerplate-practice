import { Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { EnumOrderSource } from '@runtime/prisma-client'
import { AuthJwtPayload, EnumAuthScopeType } from 'lib/nest-auth'
import { ApiRequestData, IResponseData, RequestBody } from 'lib/nest-web'
import { CartService } from 'modules/cart/services/cart.service'
import { ORDER_DOC_OPERATION } from '../constants/order.doc.constant'
import { OrderRequestPlaceDto } from '../dtos/order.request.place.dto'
import { OrderResponseDetailDto } from '../dtos/order.response.detail.dto'
import { OrderService } from '../services/order.service'

@ApiTags(ORDER_DOC_OPERATION)
@Controller({ version: '1', path: '/orders' })
export class OrderAppController {
  constructor(
    protected readonly cartService: CartService,
    protected readonly orderService: OrderService,
  ) {}

  @ApiRequestData({
    summary: ORDER_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    userVersion: true,
    jwtAccessToken: {
      scope: EnumAuthScopeType.MEMBER,
      user: {
        synchronize: false,
        require: true,
      },
    },
    response: {
      dto: OrderResponseDetailDto,
    },
  })
  @Post('/place')
  async placeOrder(
    @RequestBody() body: OrderRequestPlaceDto,
    @AuthJwtPayload('user.id') memberId: number,
  ): Promise<IResponseData> {
    const order = await this.orderService.createFromCart(memberId, {
      source: EnumOrderSource.APP,
      shipment: {
        address: body?.address,
        phone: body?.phone,
        note: body?.note,
      },
    })

    return { data: order }
  }
}
