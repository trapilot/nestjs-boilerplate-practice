import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import {
  ApiRequestList,
  IResponseList,
  RequestFilterDto,
  RequestListDto,
  RequestQueryFilterSome,
  RequestQueryList,
} from 'lib/nest-web'
import { PRODUCT_CATEGORY_DOC_APP_QUERY_LIST, PRODUCT_CATEGORY_DOC_OPERATION } from '../constants'
import { ProductCategoryResponseListDto } from '../dtos'
import { ProductCategoryService } from '../services'

@ApiTags(PRODUCT_CATEGORY_DOC_OPERATION)
@Controller({ version: '1', path: '/product-categories' })
export class ProductCategoryAppController {
  constructor(protected readonly productCategoryService: ProductCategoryService) {}

  @ApiRequestList({
    summary: PRODUCT_CATEGORY_DOC_OPERATION,
    queries: PRODUCT_CATEGORY_DOC_APP_QUERY_LIST,
    sortable: false,
    searchable: false,
    exportable: false,
    docExclude: true,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: ProductCategoryResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultOrderBy: 'sorting:desc',
      availableOrderBy: ['sorting'],
    })
    { _search, _params }: RequestListDto,
    @RequestQueryFilterSome('brandId', { parseAs: 'number' }) rawBrand: RequestFilterDto,
  ): Promise<IResponseList> {
    const _where: Prisma.ProductCategoryWhereInput = {
      ..._search,
      products: rawBrand,
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
}
