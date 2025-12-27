import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ENUM_MEDIA_TYPE, Prisma } from '@runtime/prisma-client'
import { ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import { ApiRequestList, IResponseList, RequestListDto, RequestQueryList } from 'lib/nest-web'
import { MEDIA_DOC_APP_QUERY_LIST, MEDIA_DOC_OPERATION } from '../constants'
import { MediaResponseListDto } from '../dtos'
import { MediaService } from '../services'

@ApiTags(MEDIA_DOC_OPERATION)
@Controller({ version: '1', path: '/media' })
export class MediaAppController {
  constructor(protected readonly mediaService: MediaService) {}

  @ApiRequestList({
    summary: MEDIA_DOC_OPERATION,
    queries: MEDIA_DOC_APP_QUERY_LIST,
    sortable: false,
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
      dto: MediaResponseListDto,
    },
  })
  @Get('/banners')
  async getBanners(
    @RequestQueryList({
      defaultOrderBy: 'sorting:asc',
      availableOrderBy: ['sorting'],
    })
    { _search, _params }: RequestListDto,
  ): Promise<IResponseList> {
    const _where: Prisma.MediaWhereInput = {
      ..._search,
      type: ENUM_MEDIA_TYPE.BANNER,
    }

    const listing = await this.mediaService.list(_where, _params)
    return listing
  }

  @ApiRequestList({
    summary: MEDIA_DOC_OPERATION,
    queries: MEDIA_DOC_APP_QUERY_LIST,
    sortable: false,
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
      dto: MediaResponseListDto,
    },
  })
  @Get('/sliders')
  async getSliders(
    @RequestQueryList({
      defaultOrderBy: 'sorting:asc',
      availableOrderBy: ['sorting'],
    })
    { _search, _params }: RequestListDto,
  ): Promise<IResponseList> {
    const _where: Prisma.MediaWhereInput = {
      ..._search,
      type: ENUM_MEDIA_TYPE.SLIDER,
    }

    const listing = await this.mediaService.list(_where, _params)
    return listing
  }
}
