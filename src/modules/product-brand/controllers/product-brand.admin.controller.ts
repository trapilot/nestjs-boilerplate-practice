import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { ENUM_FILE_TYPE_EXCEL } from 'lib/nest-file'
import {
  AuthJwtPayload,
  ENUM_AUTH_ABILITY_ACTION,
  ENUM_AUTH_SCOPE_TYPE,
  ENUM_AUTH_ABILITY_SUBJECT,
} from 'lib/nest-auth'
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
import { PRODUCT_BRAND_DOC_ADMIN_QUERY_LIST, PRODUCT_BRAND_DOC_OPERATION } from '../constants'
import {
  ProductBrandRequestCreateDto,
  ProductBrandRequestUpdateDto,
  ProductBrandResponseDetailDto,
  ProductBrandResponseListDto,
} from '../dtos'
import { ProductBrandService } from '../services'

@ApiTags(PRODUCT_BRAND_DOC_OPERATION)
@Controller({ path: '/product-brands' })
export class ProductBrandAdminController {
  constructor(protected readonly productBrandService: ProductBrandService) {}

  @ApiRequestPaging({
    summary: PRODUCT_BRAND_DOC_OPERATION,
    queries: PRODUCT_BRAND_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_BRAND,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: ProductBrandResponseListDto,
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
    const _where: Prisma.ProductBrandWhereInput = {
      ..._search,
    }

    const pagination = await this.productBrandService.paginate(_where, _params, {
      bookType,
    })
    return pagination
  }

  @ApiRequestList({
    summary: PRODUCT_BRAND_DOC_OPERATION,
    queries: PRODUCT_BRAND_DOC_ADMIN_QUERY_LIST,
    docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: ProductBrandResponseListDto,
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
    const _where: Prisma.ProductBrandWhereInput = {
      ..._search,
    }
    const _select: Prisma.ProductBrandSelect = {
      id: true,
      name: true,
    }

    const listing = await this.productBrandService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: PRODUCT_BRAND_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_BRAND,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: ProductBrandResponseDetailDto,
      docExpansion: true,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const productBrand = await this.productBrandService.findOrFail(id)

    return {
      data: productBrand,
    }
  }

  @ApiRequestData({
    summary: PRODUCT_BRAND_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_BRAND,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: ProductBrandResponseDetailDto,
      docExpansion: true,
    },
  })
  @Post('/')
  async create(@RequestBody() body: ProductBrandRequestCreateDto): Promise<IResponseData> {
    const productBrand = await this.productBrandService.create(body)

    return {
      data: productBrand,
    }
  }

  @ApiRequestData({
    summary: PRODUCT_BRAND_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_BRAND,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: ProductBrandResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: ProductBrandRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const productBrand = await this.productBrandService.update(id, body)

    return {
      data: productBrand,
    }
  }

  @ApiRequestData({
    summary: PRODUCT_BRAND_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_BRAND,
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
    const productBrand = await this.productBrandService.find(id)
    if (productBrand) {
      await this.productBrandService.delete(productBrand, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
