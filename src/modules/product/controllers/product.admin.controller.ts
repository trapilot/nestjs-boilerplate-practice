import { Controller, Delete, Get, Post, Put, UploadedFile } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { AuthJwtPayload, ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import { ENUM_FILE_TYPE_EXCEL, IFile } from 'lib/nest-core'
import { PrismaUtil } from 'lib/nest-prisma'
import {
  ApiRequestData,
  ApiRequestList,
  ApiRequestPaging,
  IResponseData,
  IResponseList,
  IResponsePaging,
  RequestBody,
  RequestBookType,
  RequestFileRequiredPipe,
  RequestFilterDto,
  RequestListDto,
  RequestParam,
  RequestQueryFilterBetween,
  RequestQueryFilterInBoolean,
  RequestQueryList,
} from 'lib/nest-web'
import { ENUM_APP_ABILITY_ACTION, ENUM_APP_ABILITY_SUBJECT } from 'shared/enums'
import {
  PRODUCT_DOC_ADMIN_PARAM_GET,
  PRODUCT_DOC_ADMIN_QUERY_LIST,
  PRODUCT_DOC_OPERATION,
  PRODUCT_UPLOAD_IMAGE_PATH,
} from '../constants'
import {
  ProductRequestCreateDto,
  ProductRequestUpdateDto,
  ProductResponseDetailDto,
  ProductResponseListDto,
} from '../dtos'
import { ProductService } from '../services'

@ApiTags(PRODUCT_DOC_OPERATION)
@Controller({ path: '/products' })
export class ProductAdminController {
  constructor(protected readonly productService: ProductService) {}

  @ApiRequestPaging({
    summary: PRODUCT_DOC_OPERATION,
    queries: PRODUCT_DOC_ADMIN_QUERY_LIST,
    sortable: false,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PRODUCT,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
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
      defaultOrderBy: 'id:desc',
      availableOrderBy: ['id'],
    })
    { _search, _params }: RequestListDto,
    @RequestBookType() bookType: ENUM_FILE_TYPE_EXCEL,
    @RequestQueryFilterInBoolean('isActive') _enabled: RequestFilterDto,
    @RequestQueryFilterBetween('price', {
      parseAs: 'number',
      queryField: 'salePrice',
    })
    _price: RequestFilterDto,
  ): Promise<IResponsePaging> {
    const _where: Prisma.ProductWhereInput = {
      ..._search,
      ..._enabled,
      ..._price,
    }
    const _include: Prisma.ProductInclude = {
      createdByUser: true,
      updatedByUser: true,
      deletedByUser: true,
    }

    const pagination = await this.productService.paginate(_where, _params, {
      bookType,
      include: _include,
    })
    return pagination
  }

  @ApiRequestList({
    summary: PRODUCT_DOC_OPERATION,
    sortable: false,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: ProductResponseListDto,
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
    const _where: Prisma.ProductWhereInput = {
      ..._search,
    }
    const _select: Prisma.ProductSelect = {
      id: true,
      name: true,
    }

    const listing = await this.productService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: PRODUCT_DOC_OPERATION,
    params: PRODUCT_DOC_ADMIN_PARAM_GET,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PRODUCT,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: ProductResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const product = await this.productService.findOrFail(id, {
      include: {
        createdByUser: true,
        updatedByUser: true,
        deletedByUser: true,
        medias: true,
        reviews: true,
        languages: true,
      },
    })
    return { data: product }
  }

  @ApiRequestData({
    summary: PRODUCT_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    file: {
      single: {
        field: 'thumbnail',
        filePath: PRODUCT_UPLOAD_IMAGE_PATH,
      },
    },
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PRODUCT,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: ProductResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: ProductRequestUpdateDto,
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') updatedBy: number,
    @UploadedFile() file: IFile,
  ): Promise<IResponseData> {
    const { content, termAndCond, ...dto } = body
    const jsonLanguage = { content, termAndCond }

    const data: Prisma.ProductUncheckedUpdateInput = {
      ...dto,
      updatedBy,
      thumbnail: file?.path,
      languages: PrismaUtil.buildLanguages<Prisma.ProductLanguageWhereInput>(jsonLanguage, {
        whereField: {
          productId: id,
        },
      }),
    }
    const updated = await this.productService.update(id, data, {
      include: {
        languages: true,
      },
    })
    return { data: updated }
  }

  @ApiRequestData({
    summary: PRODUCT_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    file: {
      single: {
        field: 'thumbnail',
        filePath: PRODUCT_UPLOAD_IMAGE_PATH,
      },
    },
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PRODUCT,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: ProductResponseDetailDto,
    },
  })
  @Post('/')
  async create(
    @RequestBody() body: ProductRequestCreateDto,
    @AuthJwtPayload('user.id') createdBy: number,
    @UploadedFile(new RequestFileRequiredPipe()) file: IFile,
  ): Promise<IResponseData> {
    const { content, termAndCond, ...dto } = body
    const jsonLanguage = { content, termAndCond }

    const data: Prisma.ProductUncheckedCreateInput = {
      ...dto,
      createdBy,
      thumbnail: file?.path,
      languages: PrismaUtil.buildLanguages(jsonLanguage),
    }

    const created = await this.productService.create(data, {
      include: {
        languages: true,
      },
    })
    return { data: created }
  }

  @ApiRequestData({
    summary: PRODUCT_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PRODUCT,
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
    await this.productService.delete(id, deletedBy)
    return { data: { status: true } }
  }
}
