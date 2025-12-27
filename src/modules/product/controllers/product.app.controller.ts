import { Controller, Get, Put } from '@nestjs/common'
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
  RequestQuery,
  RequestQueryList,
} from 'lib/nest-web'
import { PRODUCT_DOC_APP_QUERY_LIST, PRODUCT_DOC_OPERATION } from '../constants'
import { ProductResponseDetailDto, ProductResponseListDto } from '../dtos'
import { ProductService } from '../services'

@ApiTags(PRODUCT_DOC_OPERATION)
@Controller({ version: '1', path: '/products' })
export class ProductAppController {
  constructor(protected readonly productService: ProductService) {}

  @ApiRequestPaging({
    summary: PRODUCT_DOC_OPERATION,
    queries: PRODUCT_DOC_APP_QUERY_LIST,
    sortable: true,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: ProductResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'createdAt:desc',
      availableOrderBy: ['createdAt', 'salePrice', 'salePoint'],
    })
    { _search, _params }: RequestListDto,
    @RequestQuery('brandId', { parseAs: 'id' }) brandId: number,
    @RequestQuery('categoryId', { parseAs: 'id' }) categoryId: number,
    @RequestQuery('isWishlist', { parseAs: 'boolean' }) isWishlist: boolean,
    @AuthJwtPayload(['user.id', { parseAs: 'id' }]) memberId: number,
  ): Promise<IResponsePaging> {
    const _where: Prisma.ProductWhereInput = {
      ..._search,
      brandId,
      categoryId,
      wishlist: isWishlist ? { some: { memberId } } : undefined,
    }
    const _include: Prisma.ProductInclude = {
      brand: true,
      category: true,
      wishlist: memberId
        ? {
            where: { memberId },
            select: { productId: true },
          }
        : undefined,
    }

    const pagination = await this.productService.paginate(_where, _params, {
      include: _include,
    })
    return pagination
  }

  @ApiRequestData({
    summary: PRODUCT_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: ProductResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') memberId: number,
  ): Promise<IResponseData> {
    const product = await this.productService.findOrFail(id, {
      include: {
        brand: true,
        category: true,
        reviews: true,
        languages: true,
        wishlist: memberId
          ? {
              where: { memberId },
              select: { productId: true },
            }
          : undefined,
      },
    })
    return { data: product }
  }

  @ApiRequestData({
    summary: PRODUCT_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: true,
        require: true,
      },
    },
    response: {
      dto: ProductResponseDetailDto,
    },
  })
  @Put('/:id/add-wishlist')
  async addWishList(
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') memberId: number,
  ): Promise<IResponseData> {
    const status = await this.productService.addWishlist(id, memberId)
    return { data: { status } }
  }
}
