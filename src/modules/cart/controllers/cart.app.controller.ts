import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ENUM_ORDER_SOURCE } from '@runtime/prisma-client'
import { AuthJwtPayload, ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import {
  ApiRequestData,
  IResponseData,
  RequestBody,
  RequestCartVersion,
  RequestParam,
} from 'lib/nest-web'
import { CART_DOC_OPERATION } from '../constants'
import {
  CartRequestCheckoutDto,
  CartRequestCreateItemDto,
  CartRequestUpdateItemDto,
  CartResponseDetailDto,
} from '../dtos'
import { CartService } from '../services'

@ApiTags(CART_DOC_OPERATION)
@Controller({ version: '1', path: '/carts' })
export class CartAppController {
  constructor(protected readonly cartService: CartService) {}

  @ApiRequestData({
    summary: CART_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: false,
        require: true,
      },
    },
    response: {
      dto: CartResponseDetailDto,
    },
  })
  @Get('/info')
  async get(@AuthJwtPayload('user.id') memberId: number): Promise<IResponseData> {
    const cartItems = await this.cartService.getOrCreate(memberId)
    return { data: cartItems }
  }

  @ApiRequestData({
    summary: CART_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    cartVersion: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: false,
        require: true,
      },
    },
    response: {
      dto: CartResponseDetailDto,
    },
  })
  @Post('/checkout')
  async checkout(
    @RequestBody() body: CartRequestCheckoutDto,
    @RequestCartVersion() cartVersion: number,
    @AuthJwtPayload('user.id') memberId: number,
  ): Promise<IResponseData> {
    const cartData = await this.cartService.validate(memberId, cartVersion)
    const cartReset = await this.cartService.checkout(cartData.id, {
      source: ENUM_ORDER_SOURCE.APP,
      shipment: {
        address: body?.address,
        phone: body?.phone,
        note: body?.note,
      },
    })
    return { data: cartReset }
  }

  @ApiRequestData({
    summary: CART_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    cartVersion: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: false,
        require: true,
      },
    },
    response: {
      dto: CartResponseDetailDto,
    },
  })
  @Post('/items')
  async createItem(
    @RequestBody() body: CartRequestCreateItemDto,
    @AuthJwtPayload('user.id') memberId: number,
  ): Promise<IResponseData> {
    const cartData = await this.cartService.getCartData(memberId)
    const cartItems = await this.cartService.addItem(cartData, {
      productId: body.productId,
      quantity: body.quantity,
      promotionId: body?.promotionId,
      offerId: body?.offerId,
      bundleId: body?.bundleId,
    })
    return { data: cartItems }
  }

  @ApiRequestData({
    summary: CART_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    cartVersion: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: false,
        require: true,
      },
    },
    response: {
      dto: CartResponseDetailDto,
    },
  })
  @Put('/items/:itemId')
  async updateItem(
    @RequestBody() body: CartRequestUpdateItemDto,
    @RequestCartVersion() cartVersion: number,
    @RequestParam('itemId') itemId: number,
    @AuthJwtPayload('user.id') memberId: number,
  ): Promise<IResponseData> {
    const cartData = await this.cartService.validate(memberId, cartVersion)
    const cartItem = await this.cartService.getCartItem({ where: { id: itemId } })
    const cartItems = await this.cartService.adjustItem(cartData, cartItem, body.quantity)
    return { data: cartItems }
  }

  @ApiRequestData({
    summary: CART_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    cartVersion: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: false,
        require: true,
      },
    },
    response: {
      dto: CartResponseDetailDto,
    },
  })
  @Delete('/items/:itemId')
  async deleteItem(
    @RequestCartVersion() cartVersion: number,
    @RequestParam('itemId') itemId: number,
    @AuthJwtPayload('user.id') memberId: number,
  ): Promise<IResponseData> {
    const cartData = await this.cartService.validate(memberId, cartVersion)
    const cartItem = await this.cartService.getCartItem({ where: { id: itemId } })
    const cartItems = await this.cartService.removeItem(cartData, cartItem)
    return { data: cartItems }
  }
}
