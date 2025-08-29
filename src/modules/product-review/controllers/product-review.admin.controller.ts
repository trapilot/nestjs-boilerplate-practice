import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import {
  AuthJwtPayload,
  ENUM_AUTH_ABILITY_ACTION,
  ENUM_AUTH_ABILITY_SUBJECT,
  ENUM_AUTH_SCOPE_TYPE,
} from 'lib/nest-auth'
import { ENUM_FILE_TYPE_EXCEL } from 'lib/nest-file'
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
import { PRODUCT_REVIEW_DOC_ADMIN_QUERY_LIST, PRODUCT_REVIEW_DOC_OPERATION } from '../constants'
import {
  ProductReviewRequestCreateDto,
  ProductReviewRequestUpdateDto,
  ProductReviewResponseDetailDto,
  ProductReviewResponseListDto,
} from '../dtos'
import { ProductReviewService } from '../services'

@ApiTags(PRODUCT_REVIEW_DOC_OPERATION)
@Controller({ path: '/product-reviews' })
export class ProductReviewAdminController {
  constructor(protected readonly productReviewService: ProductReviewService) {}

  @ApiRequestPaging({
    summary: PRODUCT_REVIEW_DOC_OPERATION,
    queries: PRODUCT_REVIEW_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_REVIEW,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: ProductReviewResponseListDto,
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
    const _where: Prisma.ProductReviewWhereInput = {
      ..._search,
    }

    const pagination = await this.productReviewService.paginate(_where, _params, {
      bookType,
    })
    return pagination
  }

  @ApiRequestList({
    summary: PRODUCT_REVIEW_DOC_OPERATION,
    queries: PRODUCT_REVIEW_DOC_ADMIN_QUERY_LIST,
    docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: ProductReviewResponseListDto,
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
    const _where: Prisma.ProductReviewWhereInput = {
      ..._search,
    }
    const _select: Prisma.ProductReviewSelect = {
      id: true,
    }

    const listing = await this.productReviewService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: PRODUCT_REVIEW_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_REVIEW,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: ProductReviewResponseDetailDto,
      docExpansion: true,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const productReview = await this.productReviewService.findOrFail(id)

    return {
      data: productReview,
    }
  }

  @ApiRequestData({
    summary: PRODUCT_REVIEW_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_REVIEW,
            actions: [ENUM_AUTH_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: ProductReviewResponseDetailDto,
      docExpansion: true,
    },
  })
  @Post('/')
  async create(@RequestBody() body: ProductReviewRequestCreateDto): Promise<IResponseData> {
    const productReview = await this.productReviewService.create(body)

    return {
      data: productReview,
    }
  }

  @ApiRequestData({
    summary: PRODUCT_REVIEW_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_REVIEW,
            actions: [ENUM_AUTH_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: ProductReviewResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: ProductReviewRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const productReview = await this.productReviewService.update(id, body)

    return {
      data: productReview,
    }
  }

  @ApiRequestData({
    summary: PRODUCT_REVIEW_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_REVIEW,
            actions: [ENUM_AUTH_ABILITY_ACTION.DELETE],
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
    const productReview = await this.productReviewService.find(id)
    if (productReview) {
      await this.productReviewService.delete(productReview, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
