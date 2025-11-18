import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import {
  AuthJwtPayload,
  ENUM_AUTH_ABILITY_ACTION,
  ENUM_AUTH_ABILITY_SUBJECT,
  ENUM_AUTH_SCOPE_TYPE,
} from 'lib/nest-auth'
import { ENUM_FILE_TYPE_EXCEL } from 'lib/nest-core'
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
import { PRODUCT_HISTORY_DOC_ADMIN_QUERY_LIST, PRODUCT_HISTORY_DOC_OPERATION } from '../constants'
import {
  ProductHistoryRequestCreateDto,
  ProductHistoryRequestUpdateDto,
  ProductHistoryResponseDetailDto,
  ProductHistoryResponseListDto,
} from '../dtos'
import { ProductHistoryService } from '../services'

@ApiTags(PRODUCT_HISTORY_DOC_OPERATION)
@Controller({ path: '/product-histories' })
export class ProductHistoryAdminController {
  constructor(protected readonly productHistoryService: ProductHistoryService) {}

  @ApiRequestPaging({
    summary: PRODUCT_HISTORY_DOC_OPERATION,
    queries: PRODUCT_HISTORY_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_HISTORY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: ProductHistoryResponseListDto,
      docExpansion: true,
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
    const _where: Prisma.MemberProductHistoryWhereInput = {
      ..._search,
    }
    const _include: Prisma.MemberProductHistoryInclude = {
      member: true,
      product: true,
      order: true,
    }

    const pagination = await this.productHistoryService.paginate(_where, _params, {
      bookType,
      include: _include,
    })
    return pagination
  }

  @ApiRequestList({
    summary: PRODUCT_HISTORY_DOC_OPERATION,
    queries: PRODUCT_HISTORY_DOC_ADMIN_QUERY_LIST,
    docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: ProductHistoryResponseListDto,
      docExpansion: true,
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
    const _where: Prisma.MemberProductHistoryWhereInput = {
      ..._search,
    }
    const _select: Prisma.MemberProductHistorySelect = {
      id: true,
    }

    const listing = await this.productHistoryService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: PRODUCT_HISTORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_HISTORY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: ProductHistoryResponseDetailDto,
      docExpansion: true,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const productHistory = await this.productHistoryService.findOrFail(id, {
      include: {
        member: true,
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_HISTORY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: ProductHistoryResponseDetailDto,
      docExpansion: true,
    },
  })
  @Post('/')
  async create(@RequestBody() body: ProductHistoryRequestCreateDto): Promise<IResponseData> {
    const productHistory = await this.productHistoryService.create(body)

    return {
      data: productHistory,
    }
  }

  @ApiRequestData({
    summary: PRODUCT_HISTORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_HISTORY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: ProductHistoryResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: ProductHistoryRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const productHistory = await this.productHistoryService.update(id, body)

    return {
      data: productHistory,
    }
  }

  @ApiRequestData({
    summary: PRODUCT_HISTORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_HISTORY,
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
    const productHistory = await this.productHistoryService.find(id)
    if (productHistory) {
      await this.productHistoryService.delete(productHistory, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
