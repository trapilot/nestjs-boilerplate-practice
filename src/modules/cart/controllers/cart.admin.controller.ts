import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import {
  AuthJwtPayload,
  ENUM_AUTH_ABILITY_ACTION,
  ENUM_AUTH_ABILITY_SUBJECT,
  ENUM_AUTH_SCOPE_TYPE,
} from 'lib/nest-auth'
import { ENUM_FILE_TYPE_EXCEL } from 'lib/nest-file'
import {
  ApiRequestData,
  ApiRequestList,
  ApiRequestPaging,
  IResponseData,
  IResponseList,
  IResponsePaging,
  RequestBody,
  RequestBookType,
  RequestListDto,
  RequestParam,
  RequestQueryList,
} from 'lib/nest-web'
import { CART_DOC_ADMIN_QUERY_LIST, CART_DOC_OPERATION } from '../constants'
import {
  CartRequestCreateDto,
  CartRequestUpdateDto,
  CartResponseDetailDto,
  CartResponseListDto,
} from '../dtos'
import { CartService } from '../services'

@ApiTags(CART_DOC_OPERATION)
@Controller({ path: '/carts' })
export class CartAdminController {
  constructor(protected readonly cartService: CartService) {}

  @ApiRequestPaging({
    summary: CART_DOC_OPERATION,
    queries: CART_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.CART,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: CartResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'id:desc',
      availableOrderBy: ['id'],
    })
    { _search, _params }: RequestListDto,
    @RequestBookType() bookType: ENUM_FILE_TYPE_EXCEL,
  ): Promise<IResponsePaging> {
    const _where: Prisma.CartWhereInput = {
      ..._search,
    }

    const pagination = await this.cartService.paginate(_where, _params, {
      bookType,
    })
    return pagination
  }

  @ApiRequestList({
    summary: CART_DOC_OPERATION,
    queries: CART_DOC_ADMIN_QUERY_LIST,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: CartResponseListDto,
    },
  })
  @Get('/map-shorted')
  async mapShorted(
    @RequestQueryList({
      defaultOrderBy: 'name:asc',
      availableOrderBy: ['name'],
    })
    { _search, _params }: RequestListDto,
  ): Promise<IResponseList> {
    const _where: Prisma.CartWhereInput = {
      ..._search,
    }
    const _select: Prisma.CartSelect = {
      id: true,
    }

    const listing = await this.cartService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: CART_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.CART,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: CartResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const cart = await this.cartService.findOrFail(id)

    return {
      data: cart,
    }
  }

  @ApiRequestData({
    summary: CART_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.CART,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: CartResponseDetailDto,
    },
  })
  @Post('/')
  async create(@RequestBody() body: CartRequestCreateDto): Promise<IResponseData> {
    const cart = await this.cartService.create(body)

    return {
      data: cart,
    }
  }

  @ApiRequestData({
    summary: CART_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.CART,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: CartResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: CartRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const cart = await this.cartService.update(id, body)

    return {
      data: cart,
    }
  }

  @ApiRequestData({
    summary: CART_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.CART,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.DELETE],
          },
        ],
      },
    },
  })
  @Delete('/:id')
  async delete(
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') deletedBy: number,
  ): Promise<IResponseData> {
    const cart = await this.cartService.find(id)
    if (cart) {
      await this.cartService.delete(cart, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
