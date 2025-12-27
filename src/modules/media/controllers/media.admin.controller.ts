import { Controller, Delete, Get, Post, Put, UploadedFile } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { AuthJwtPayload, ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import { ENUM_FILE_TYPE_EXCEL, IFile } from 'lib/nest-core'
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
  RequestFileTypePipe,
  RequestListDto,
  RequestParam,
  RequestQueryList,
} from 'lib/nest-web'
import { ENUM_APP_ABILITY_ACTION, ENUM_APP_ABILITY_SUBJECT } from 'shared/enums'
import {
  MEDIA_DOC_ADMIN_QUERY_LIST,
  MEDIA_DOC_OPERATION,
  MEDIA_UPLOAD_IMAGE_MIME,
  MEDIA_UPLOAD_IMAGE_PATH,
} from '../constants'
import {
  MediaRequestCreateDto,
  MediaRequestUpdateDto,
  MediaResponseDetailDto,
  MediaResponseListDto,
} from '../dtos'
import { MediaService } from '../services'

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
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.MEDIA,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
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
    @RequestBookType() bookType: ENUM_FILE_TYPE_EXCEL,
  ): Promise<IResponsePaging> {
    const _where: Prisma.MediaWhereInput = {
      ..._search,
    }

    const pagination = await this.mediaService.paginate(_where, _params, {
      bookType,
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
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
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
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.MEDIA,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
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
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.MEDIA,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.CREATE],
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
    @UploadedFile(new RequestFileRequiredPipe(), new RequestFileTypePipe(MEDIA_UPLOAD_IMAGE_MIME))
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
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.MEDIA,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
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
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.MEDIA,
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
    const media = await this.mediaService.find(id)
    if (media) {
      await this.mediaService.delete(media, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
