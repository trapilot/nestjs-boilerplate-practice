import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthScopeType } from 'lib/nest-auth'
import { ApiRequestList, IResponseList, RequestListDto, RequestQueryList } from 'lib/nest-web'
import {
  PRODUCT_BRAND_DOC_APP_QUERY_LIST,
  PRODUCT_BRAND_DOC_OPERATION,
} from '../constants/product-brand.doc.constant'
import { ProductBrandResponseListDto } from '../dtos/product-brand.response.detail.dto'
import { ProductBrandService } from '../services/product-brand.service'

@ApiTags(PRODUCT_BRAND_DOC_OPERATION)
@Controller({ version: '1', path: '/product-brands' })
export class ProductBrandAppController {
  constructor(protected readonly productBrandService: ProductBrandService) {}

  @ApiRequestList({
    summary: PRODUCT_BRAND_DOC_OPERATION,
    queries: PRODUCT_BRAND_DOC_APP_QUERY_LIST,
    sortable: false,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.MEMBER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: ProductBrandResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultOrderBy: 'sorting:desc',
      availableOrderBy: ['sorting'],
    })
    { _search, _params }: RequestListDto,
  ): Promise<IResponseList> {
    const _where: Prisma.ProductBrandWhereInput = {
      ..._search,
      isActive: true,
    }

    const listing = await this.productBrandService.list(_where, _params)
    return listing
  }
}
