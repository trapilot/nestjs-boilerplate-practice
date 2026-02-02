import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthJwtPayload, EnumAuthScopeType } from 'lib/nest-auth'
import {
  ApiRequestData,
  IResponseData,
  RequestBody,
  RequestParam,
  RequestUserVersion,
} from 'lib/nest-web'
import { CART_DOC_OPERATION } from '../constants/cart.doc.constant'
import { CartRequestCreateItemDto } from '../dtos/cart.request.create-item.dto'
import { CartRequestUpdateItemDto } from '../dtos/cart.request.update-item.dto'
import { CartResponseDetailDto } from '../dtos/cart.response.detail.dto'
import { CartService } from '../services/cart.service'

@ApiTags(CART_DOC_OPERATION)
@Controller({ version: '1', path: '/carts' })
export class CartAppController {
  constructor(protected readonly cartService: CartService) {}

  @ApiRequestData({
    summary: CART_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.MEMBER,
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
    userVersion: true,
    jwtAccessToken: {
      scope: EnumAuthScopeType.MEMBER,
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
    userVersion: true,
    jwtAccessToken: {
      scope: EnumAuthScopeType.MEMBER,
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
    @RequestUserVersion() cartVersion: number,
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
    userVersion: true,
    jwtAccessToken: {
      scope: EnumAuthScopeType.MEMBER,
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
    @RequestUserVersion() cartVersion: number,
    @RequestParam('itemId') itemId: number,
    @AuthJwtPayload('user.id') memberId: number,
  ): Promise<IResponseData> {
    const cartData = await this.cartService.validate(memberId, cartVersion)
    const cartItem = await this.cartService.getCartItem({ where: { id: itemId } })
    const cartItems = await this.cartService.removeItem(cartData, cartItem)
    return { data: cartItems }
  }
}
