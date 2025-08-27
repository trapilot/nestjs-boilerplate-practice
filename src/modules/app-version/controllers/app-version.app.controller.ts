import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import { ApiRequestList, IResponseList, RequestListDto, RequestQueryList } from 'lib/nest-web'
import { APP_VERSION_DOC_APP_QUERY_LIST, APP_VERSION_DOC_OPERATION } from '../constants'
import { AppVersionResponseListDto } from '../dtos'
import { AppVersionService } from '../services'

@ApiTags(APP_VERSION_DOC_OPERATION)
@Controller({ version: '1', path: '/app-versions' })
export class AppVersionAppController {
  constructor(protected readonly appVersionService: AppVersionService) {}

  @ApiRequestList({
    summary: APP_VERSION_DOC_OPERATION,
    queries: APP_VERSION_DOC_APP_QUERY_LIST,
    docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: AppVersionResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultOrderBy: 'name:asc',
      availableOrderBy: ['name'],
    })
    { _search, _params }: RequestListDto,
  ): Promise<IResponseList> {
    const _where: Prisma.AppVersionWhereInput = {
      ..._search,
    }
    const _select: Prisma.AppVersionSelect = {
      id: true,
    }

    const listing = await this.appVersionService.list(_where, _params, {
      select: _select,
    })
    return listing
  }
}
