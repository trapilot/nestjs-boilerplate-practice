import { Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { EnumOrderSource } from '@runtime/prisma-client'
import { AuthJwtPayload, EnumAuthScopeType } from 'lib/nest-auth'
import { ApiRequestData, IResponseData, RequestBody, RequestUserVersion } from 'lib/nest-web'
import { CartService } from 'modules/cart/services/cart.service'
import { ORDER_DOC_OPERATION } from '../constants/order.doc.constant'
import { OrderRequestCheckoutDto } from '../dtos/order.request.checkout.dto'
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
  @Post('/checkout')
  async checkout(
    @RequestBody() body: OrderRequestCheckoutDto,
    @RequestUserVersion() cartVersion: number,
    @AuthJwtPayload('user.id') memberId: number,
  ): Promise<IResponseData> {
    const cart = await this.cartService.validate(memberId, cartVersion)
    const order = await this.orderService.createFromCart(cart.id, {
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
