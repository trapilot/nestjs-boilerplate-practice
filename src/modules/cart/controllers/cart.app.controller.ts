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
  @Get('/_me')
  async get(@AuthJwtPayload('user.id') memberId: number): Promise<IResponseData> {
    const data = await this.cartService.getOrCreateActiveCart(memberId)
    return { data }
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
    const cartData = await this.cartService.addItem(memberId, body)
    return { data: cartData }
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
    await this.cartService.validateActiveCart(memberId, cartVersion)
    const cartData = await this.cartService.adjustItem(memberId, itemId, body.quantity)
    return { data: cartData }
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
    await this.cartService.validateActiveCart(memberId, cartVersion)
    const cartData = await this.cartService.removeItem(memberId, itemId)
    return { data: cartData }
  }
}
