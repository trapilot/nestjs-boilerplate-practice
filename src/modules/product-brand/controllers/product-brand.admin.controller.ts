import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums/user.enum'
import { AuthJwtPayload, EnumAuthScopeType } from 'lib/nest-auth'
import { EnumFileExtensionDocument } from 'lib/nest-core'
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
import {
  PRODUCT_BRAND_DOC_ADMIN_QUERY_LIST,
  PRODUCT_BRAND_DOC_OPERATION,
} from '../constants/product-brand.doc.constant'
import { ProductBrandRequestCreateDto } from '../dtos/product-brand.request.create.dto'
import { ProductBrandRequestUpdateDto } from '../dtos/product-brand.request.update.dto'
import {
  ProductBrandResponseDetailDto,
  ProductBrandResponseListDto,
} from '../dtos/product-brand.response.detail.dto'
import { ProductBrandService } from '../services/product-brand.service'

@ApiTags(PRODUCT_BRAND_DOC_OPERATION)
@Controller({ path: '/product-brands' })
export class ProductBrandAdminController {
  constructor(protected readonly productBrandService: ProductBrandService) {}

  @ApiRequestPaging({
    summary: PRODUCT_BRAND_DOC_OPERATION,
    queries: PRODUCT_BRAND_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.PRODUCT_BRAND,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: ProductBrandResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'id:desc',
      availableOrderBy: ['id'],
    })
    { _search, _kwargs }: RequestListDto,
    @RequestBookType() bookType: EnumFileExtensionDocument,
  ): Promise<IResponsePaging> {
    const kwargs: Prisma.ProductBrandFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
      },
    }

    return await this.productBrandService.getPage(kwargs, {
      document: bookType,
    })
  }

  @ApiRequestList({
    summary: PRODUCT_BRAND_DOC_OPERATION,
    queries: PRODUCT_BRAND_DOC_ADMIN_QUERY_LIST,
    sortable: false,
    searchable: false,
    exportable: false,
    docExclude: true,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: ProductBrandResponseListDto,
    },
  })
  @Get('/map-shorted')
  async mapShorted(
    @RequestQueryList({
      defaultOrderBy: 'name:asc',
      availableOrderBy: ['name'],
    })
    { _search, _kwargs }: RequestListDto,
  ): Promise<IResponseList> {
    return await this.productBrandService.getList({
      ..._kwargs,
      where: { ..._search },
      select: { id: true, name: true },
    })
  }

  @ApiRequestData({
    summary: PRODUCT_BRAND_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.PRODUCT_BRAND,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: ProductBrandResponseDetailDto,
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
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.PRODUCT_BRAND,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: ProductBrandResponseDetailDto,
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
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.PRODUCT_BRAND,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: ProductBrandResponseDetailDto,
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
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.PRODUCT_BRAND,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.DELETE],
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
    await this.productBrandService.delete(id, deletedBy)

    return {
      data: { status: true },
    }
  }
}
