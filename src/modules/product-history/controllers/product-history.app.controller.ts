import { Controller, Get, Patch } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { AuthJwtPayload, ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import {
  ApiRequestData,
  ApiRequestPaging,
  IResponseData,
  IResponsePaging,
  RequestListDto,
  RequestParam,
  RequestQueryList,
} from 'lib/nest-web'
import { PRODUCT_HISTORY_DOC_APP_QUERY_LIST, PRODUCT_HISTORY_DOC_OPERATION } from '../constants'
import { ProductHistoryResponseDetailDto, ProductHistoryResponseListDto } from '../dtos'
import { ProductHistoryService } from '../services'

@ApiTags(PRODUCT_HISTORY_DOC_OPERATION)
@Controller({ version: '1', path: '/product-histories' })
export class ProductHistoryAppController {
  constructor(protected readonly productHistoryService: ProductHistoryService) {}

  @ApiRequestPaging({
    summary: PRODUCT_HISTORY_DOC_OPERATION,
    queries: PRODUCT_HISTORY_DOC_APP_QUERY_LIST,
    sortable: true,
    searchable: false,
    exportable: false,
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
      dto: ProductHistoryResponseListDto,
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
    @AuthJwtPayload(['user.id', { parseAs: 'id' }]) memberId: number,
  ): Promise<IResponsePaging> {
    const _where: Prisma.MemberProductHistoryWhereInput = {
      ..._search,
      memberId,
    }
    const _include: Prisma.MemberProductHistoryInclude = {
      product: true,
      order: true,
    }

    const pagination = await this.productHistoryService.paginate(_where, _params, {
      include: _include,
    })
    return pagination
  }

  @ApiRequestData({
    summary: PRODUCT_HISTORY_DOC_OPERATION,
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
      dto: ProductHistoryResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const productHistory = await this.productHistoryService.findOrFail(id, {
      include: {
        product: true,
        order: true,
      },
    })

    return {
      data: productHistory,
    }
  }
  @ApiRequestData({
    summary: PRODUCT_HISTORY_DOC_OPERATION,
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
      dto: ProductHistoryResponseDetailDto,
    },
  })
  @Patch('/:id/reserve')
  async reserve(
    @RequestParam('id') id: number,
    @AuthJwtPayload(['user.id', { parseAs: 'id' }]) memberId: number,
  ): Promise<IResponseData> {
    const productHistory = await this.productHistoryService.matchOrFail({
      id,
      memberId,
    })

    const reserved = await this.productHistoryService.reserve(productHistory)

    return {
      data: reserved,
    }
  }
}
