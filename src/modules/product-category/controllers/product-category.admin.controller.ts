import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { AuthJwtPayload, ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
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
import { ENUM_APP_ABILITY_ACTION, ENUM_APP_ABILITY_SUBJECT } from 'shared/enums'
import { PRODUCT_CATEGORY_DOC_ADMIN_QUERY_LIST, PRODUCT_CATEGORY_DOC_OPERATION } from '../constants'
import {
  ProductCategoryRequestCreateDto,
  ProductCategoryRequestUpdateDto,
  ProductCategoryResponseDetailDto,
  ProductCategoryResponseListDto,
} from '../dtos'
import { ProductCategoryService } from '../services'

@ApiTags(PRODUCT_CATEGORY_DOC_OPERATION)
@Controller({ path: '/product-categories' })
export class ProductCategoryAdminController {
  constructor(protected readonly productCategoryService: ProductCategoryService) {}

  @ApiRequestPaging({
    summary: PRODUCT_CATEGORY_DOC_OPERATION,
    queries: PRODUCT_CATEGORY_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PRODUCT_CATEGORY,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: ProductCategoryResponseListDto,
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
    const _where: Prisma.ProductCategoryWhereInput = {
      ..._search,
    }

    const pagination = await this.productCategoryService.paginate(_where, _params, {
      bookType,
    })
    return pagination
  }

  @ApiRequestList({
    summary: PRODUCT_CATEGORY_DOC_OPERATION,
    queries: PRODUCT_CATEGORY_DOC_ADMIN_QUERY_LIST,
    docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: ProductCategoryResponseListDto,
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
    const _where: Prisma.ProductCategoryWhereInput = {
      ..._search,
    }
    const _select: Prisma.ProductCategorySelect = {
      id: true,
      name: true,
    }

    const listing = await this.productCategoryService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: PRODUCT_CATEGORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PRODUCT_CATEGORY,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: ProductCategoryResponseDetailDto,
      docExpansion: true,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const productCategory = await this.productCategoryService.findOrFail(id)

    return {
      data: productCategory,
    }
  }

  @ApiRequestData({
    summary: PRODUCT_CATEGORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PRODUCT_CATEGORY,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: ProductCategoryResponseDetailDto,
      docExpansion: true,
    },
  })
  @Post('/')
  async create(@RequestBody() body: ProductCategoryRequestCreateDto): Promise<IResponseData> {
    const productCategory = await this.productCategoryService.create(body)

    return {
      data: productCategory,
    }
  }

  @ApiRequestData({
    summary: PRODUCT_CATEGORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PRODUCT_CATEGORY,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: ProductCategoryResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: ProductCategoryRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const productCategory = await this.productCategoryService.update(id, body)

    return {
      data: productCategory,
    }
  }

  @ApiRequestData({
    summary: PRODUCT_CATEGORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PRODUCT_CATEGORY,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.DELETE],
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
    const productCategory = await this.productCategoryService.find(id)
    if (productCategory) {
      await this.productCategoryService.delete(productCategory, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
