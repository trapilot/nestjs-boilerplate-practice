import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import { ApiRequestList, IResponseList, RequestListDto, RequestQueryList } from 'lib/nest-web'
import { PRODUCT_BRAND_DOC_APP_QUERY_LIST, PRODUCT_BRAND_DOC_OPERATION } from '../constants'
import { ProductBrandResponseListDto } from '../dtos'
import { ProductBrandService } from '../services'

@ApiTags(PRODUCT_BRAND_DOC_OPERATION)
@Controller({ version: '1', path: '/product-brands' })
export class ProductBrandAppController {
  constructor(protected readonly productBrandService: ProductBrandService) {}

  @ApiRequestList({
    summary: PRODUCT_BRAND_DOC_OPERATION,
    queries: PRODUCT_BRAND_DOC_APP_QUERY_LIST,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
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
