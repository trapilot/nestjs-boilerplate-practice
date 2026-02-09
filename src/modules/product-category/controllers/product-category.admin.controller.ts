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
  PRODUCT_CATEGORY_DOC_ADMIN_QUERY_LIST,
  PRODUCT_CATEGORY_DOC_OPERATION,
} from '../constants/product-category.doc.constant'

import { ProductCategoryRequestCreateDto } from '../dtos/product-category.request.create.dto'
import { ProductCategoryRequestUpdateDto } from '../dtos/product-category.request.update.dto'
import {
  ProductCategoryResponseDetailDto,
  ProductCategoryResponseListDto,
} from '../dtos/product-category.response.detail.dto'
import { ProductCategoryService } from '../services/product-category.service'

@ApiTags(PRODUCT_CATEGORY_DOC_OPERATION)
@Controller({ path: '/product-categories' })
export class ProductCategoryAdminController {
  constructor(protected readonly productCategoryService: ProductCategoryService) {}

  @ApiRequestPaging({
    summary: PRODUCT_CATEGORY_DOC_OPERATION,
    queries: PRODUCT_CATEGORY_DOC_ADMIN_QUERY_LIST,
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
            subject: EnumAuthAbilitySubject.PRODUCT_CATEGORY,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: ProductCategoryResponseListDto,
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
    const kwargs: Prisma.ProductCategoryFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
      },
    }

    return await this.productCategoryService.getPage(kwargs, {
      document: bookType,
    })
  }

  @ApiRequestList({
    summary: PRODUCT_CATEGORY_DOC_OPERATION,
    queries: PRODUCT_CATEGORY_DOC_ADMIN_QUERY_LIST,
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
      dto: ProductCategoryResponseListDto,
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
    return await this.productCategoryService.getList({
      ..._kwargs,
      where: { ..._search },
      select: { id: true, name: true },
    })
  }

  @ApiRequestData({
    summary: PRODUCT_CATEGORY_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.PRODUCT_CATEGORY,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: ProductCategoryResponseDetailDto,
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
            subject: EnumAuthAbilitySubject.PRODUCT_CATEGORY,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: ProductCategoryResponseDetailDto,
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
            subject: EnumAuthAbilitySubject.PRODUCT_CATEGORY,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: ProductCategoryResponseDetailDto,
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
            subject: EnumAuthAbilitySubject.PRODUCT_CATEGORY,
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
    await this.productCategoryService.delete(id, deletedBy)

    return {
      data: { status: true },
    }
  }
}
