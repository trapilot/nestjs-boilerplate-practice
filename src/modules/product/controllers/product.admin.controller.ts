import { Controller, Delete, Get, Post, Put, UploadedFile } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums/user.enum'
import { AuthJwtPayload, EnumAuthScopeType } from 'lib/nest-auth'
import { EnumFileExtensionDocument, IFile } from 'lib/nest-core'
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
  RequestFilterDto,
  RequestListDto,
  RequestParam,
  RequestQueryFilterBetween,
  RequestQueryFilterInBoolean,
  RequestQueryList,
  RequestRequiredPipe,
} from 'lib/nest-web'
import { PRODUCT_UPLOAD_IMAGE_PATH } from '../constants/product.constant'
import {
  PRODUCT_DOC_ADMIN_PARAM_GET,
  PRODUCT_DOC_ADMIN_QUERY_LIST,
  PRODUCT_DOC_OPERATION,
} from '../constants/product.doc.constant'
import { ProductRequestCreateDto } from '../dtos/product.request.create.dto'
import { ProductRequestUpdateDto } from '../dtos/product.request.update.dto'
import {
  ProductResponseDetailDto,
  ProductResponseListDto,
} from '../dtos/product.response.detail.dto'
import { ProductService } from '../services/product.service'

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
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.PRODUCT,
            actions: [EnumAuthAbilityAction.READ],
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
    { _search, _kwargs }: RequestListDto,
    @RequestBookType() bookType: EnumFileExtensionDocument,
    @RequestQueryFilterInBoolean('isActive') _enabled: RequestFilterDto,
    @RequestQueryFilterBetween('price', {
      parseAs: 'number',
      queryField: 'salePrice',
    })
    _price: RequestFilterDto,
  ): Promise<IResponsePaging> {
    const kwargs: Prisma.ProductFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
        ..._enabled,
        ..._price,
      },
      include: {
        createdByUser: true,
        updatedByUser: true,
        deletedByUser: true,
      },
    }

    return await this.productService.getPage(kwargs, {
      document: bookType,
    })
  }

  @ApiRequestList({
    summary: PRODUCT_DOC_OPERATION,
    sortable: false,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
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
    { _search, _kwargs }: RequestListDto,
  ): Promise<IResponseList> {
    return await this.productService.getList({
      ..._kwargs,
      where: { ..._search },
      select: { id: true, name: true },
    })
  }

  @ApiRequestData({
    summary: PRODUCT_DOC_OPERATION,
    params: PRODUCT_DOC_ADMIN_PARAM_GET,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.PRODUCT,
            actions: [EnumAuthAbilityAction.READ],
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
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.PRODUCT,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
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
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.PRODUCT,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
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
    @UploadedFile(RequestRequiredPipe) file: IFile,
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
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.PRODUCT,
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
    await this.productService.delete(id, deletedBy)
    return { data: { status: true } }
  }
}
