import { Controller, Delete, Get, Post, Put, UploadedFile } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums/user.enum'
import { AuthJwtPayload, EnumAuthScopeType } from 'lib/nest-auth'
import {
  EnumFileExtensionDocument,
  EnumFileExtensionImage,
  FileExtensionPipe,
  IFile,
} from 'lib/nest-core'
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
  RequestRequiredPipe,
} from 'lib/nest-web'
import { MEDIA_UPLOAD_IMAGE_PATH } from '../constants/media.constant'
import { MEDIA_DOC_ADMIN_QUERY_LIST, MEDIA_DOC_OPERATION } from '../constants/media.doc.constant'
import { MediaRequestCreateDto } from '../dtos/media.request.create.dto'
import { MediaRequestUpdateDto } from '../dtos/media.request.update.dto'
import { MediaResponseDetailDto, MediaResponseListDto } from '../dtos/media.response.detail.dto'
import { MediaService } from '../services/media.service'

@ApiTags(MEDIA_DOC_OPERATION)
@Controller({ path: '/media' })
export class MediaAdminController {
  constructor(protected readonly mediaService: MediaService) {}

  @ApiRequestPaging({
    summary: MEDIA_DOC_OPERATION,
    queries: MEDIA_DOC_ADMIN_QUERY_LIST,
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
            subject: EnumAuthAbilitySubject.MEDIA,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: MediaResponseListDto,
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
    @RequestBookType() bookType: EnumFileExtensionDocument,
  ): Promise<IResponsePaging> {
    const _where: Prisma.MediaWhereInput = {
      ..._search,
    }

    const pagination = await this.mediaService.paginate(_where, _params, {
      document: bookType,
    })
    return pagination
  }

  @ApiRequestList({
    summary: MEDIA_DOC_OPERATION,
    queries: MEDIA_DOC_ADMIN_QUERY_LIST,
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
      dto: MediaResponseListDto,
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
    const _where: Prisma.MediaWhereInput = {
      ..._search,
    }
    const _select: Prisma.MediaSelect = {
      id: true,
    }

    const listing = await this.mediaService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: MEDIA_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.MEDIA,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: MediaResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const media = await this.mediaService.findOrFail(id)

    return {
      data: media,
    }
  }

  @ApiRequestData({
    summary: MEDIA_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    file: {
      single: {
        field: 'url',
        filePath: MEDIA_UPLOAD_IMAGE_PATH,
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
            subject: EnumAuthAbilitySubject.MEDIA,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: MediaResponseDetailDto,
    },
  })
  @Post('/')
  async create(
    @RequestBody() body: MediaRequestCreateDto,
    @UploadedFile(
      RequestRequiredPipe,
      FileExtensionPipe([
        EnumFileExtensionImage.JPEG,
        EnumFileExtensionImage.JPG,
        EnumFileExtensionImage.PNG,
      ]),
    )
    file: IFile,
  ): Promise<IResponseData> {
    const media = await this.mediaService.create({
      ...body,
      mime: file?.mimetype,
      url: file?.path,
    })

    return {
      data: media,
    }
  }

  @ApiRequestData({
    summary: MEDIA_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.MEDIA,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: MediaResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: MediaRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const media = await this.mediaService.update(id, body)

    return {
      data: media,
    }
  }

  @ApiRequestData({
    summary: MEDIA_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.MEDIA,
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
    const media = await this.mediaService.find(id)
    if (media) {
      await this.mediaService.delete(media, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
