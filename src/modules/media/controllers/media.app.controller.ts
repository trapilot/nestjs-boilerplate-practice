import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { EnumMediaType, Prisma } from '@runtime/prisma-client'
import { EnumAuthScopeType } from 'lib/nest-auth'
import { ApiRequestList, IResponseList, RequestListDto, RequestQueryList } from 'lib/nest-web'
import { MEDIA_DOC_APP_QUERY_LIST, MEDIA_DOC_OPERATION } from '../constants/media.doc.constant'
import { MediaResponseListDto } from '../dtos/media.response.detail.dto'
import { MediaService } from '../services/media.service'

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
      scope: EnumAuthScopeType.MEMBER,
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
      type: EnumMediaType.BANNER,
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
      scope: EnumAuthScopeType.MEMBER,
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
      type: EnumMediaType.SLIDER,
    }

    const listing = await this.mediaService.list(_where, _params)
    return listing
  }
}
