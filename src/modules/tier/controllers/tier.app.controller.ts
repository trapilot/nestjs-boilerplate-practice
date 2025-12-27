import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import { ApiRequestList, IResponseList, RequestListDto, RequestQueryList } from 'lib/nest-web'
import { TIER_DOC_ADMIN_QUERY_LIST, TIER_DOC_OPERATION } from '../constants'
import { TierResponseListDto } from '../dtos'
import { TierService } from '../services'

@ApiTags(TIER_DOC_OPERATION)
@Controller({ version: '1', path: '/tiers' })
export class TierAppController {
  constructor(protected readonly tierService: TierService) {}

  @ApiRequestList({
    summary: TIER_DOC_OPERATION,
    queries: TIER_DOC_ADMIN_QUERY_LIST,
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
      dto: TierResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultOrderBy: 'level:asc',
      availableOrderBy: ['level'],
    })
    { _search, _params }: RequestListDto,
  ): Promise<IResponseList> {
    const _where: Prisma.TierWhereInput = {
      ..._search,
    }

    const listing = await this.tierService.list(_where, _params)
    return listing
  }
}
