import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthScopeType } from 'lib/nest-auth'
import { ApiRequestList, IResponseList, RequestListDto, RequestQueryList } from 'lib/nest-web'
import { TIER_DOC_ADMIN_QUERY_LIST, TIER_DOC_OPERATION } from '../constants/tier.doc.constant'
import { TierResponseListDto } from '../dtos/tier.response.detail.dto'
import { TierService } from '../services/tier.service'

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
      scope: EnumAuthScopeType.MEMBER,
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
    { _search, _kwargs }: RequestListDto,
  ): Promise<IResponseList> {
    const kwargs: Prisma.TierFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
      },
    }

    return await this.tierService.getList(kwargs)
  }
}
