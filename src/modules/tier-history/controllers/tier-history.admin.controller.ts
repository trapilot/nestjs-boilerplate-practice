import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import {
  AuthJwtPayload,
  ENUM_AUTH_ABILITY_ACTION,
  ENUM_AUTH_ABILITY_SUBJECT,
  ENUM_AUTH_SCOPE_TYPE,
} from 'lib/nest-auth'
import { ENUM_FILE_TYPE_EXCEL } from 'lib/nest-core'
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
import { TIER_HISTORY_DOC_ADMIN_QUERY_LIST, TIER_HISTORY_DOC_OPERATION } from '../constants'
import {
  TierHistoryRequestCreateDto,
  TierHistoryRequestUpdateDto,
  TierHistoryResponseDetailDto,
  TierHistoryResponseListDto,
} from '../dtos'
import { TierHistoryService } from '../services'

@ApiTags(TIER_HISTORY_DOC_OPERATION)
@Controller({ path: '/tier-histories' })
export class TierHistoryAdminController {
  constructor(protected readonly tierHistoryService: TierHistoryService) {}

  @ApiRequestPaging({
    summary: TIER_HISTORY_DOC_OPERATION,
    queries: TIER_HISTORY_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.TIER_HISTORY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: TierHistoryResponseListDto,
      docExpansion: true,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'isActive:desc|id:desc',
      availableOrderBy: ['id', 'isActive'],
    })
    { _search, _params }: RequestListDto,
    @RequestBookType() bookType: ENUM_FILE_TYPE_EXCEL,
  ): Promise<IResponsePaging> {
    const _where: Prisma.MemberTierHistoryWhereInput = {
      ..._search,
      isVisible: true,
    }

    const _include: Prisma.MemberTierHistoryInclude = {
      member: true,
      invoice: true,
      prevTier: true,
      currTier: true,
    }

    const pagination = await this.tierHistoryService.paginate(_where, _params, {
      bookType,
      include: _include,
    })
    return pagination
  }

  @ApiRequestList({
    summary: TIER_HISTORY_DOC_OPERATION,
    queries: TIER_HISTORY_DOC_ADMIN_QUERY_LIST,
    docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: TierHistoryResponseListDto,
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
    const _where: Prisma.MemberTierHistoryWhereInput = {
      ..._search,
      isVisible: true,
    }
    const _select: Prisma.MemberTierHistorySelect = {
      id: true,
    }

    const listing = await this.tierHistoryService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: TIER_HISTORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.TIER_HISTORY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: TierHistoryResponseDetailDto,
      docExpansion: true,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const tierHistory = await this.tierHistoryService.findOrFail(id, {
      include: {
        member: true,
        invoice: true,
        prevTier: true,
        currTier: true,
      },
    })

    return {
      data: tierHistory,
    }
  }

  @ApiRequestData({
    summary: TIER_HISTORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.TIER_HISTORY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: TierHistoryResponseDetailDto,
      docExpansion: true,
    },
  })
  @Post('/')
  async create(@RequestBody() body: TierHistoryRequestCreateDto): Promise<IResponseData> {
    const tierHistory = await this.tierHistoryService.create(body)

    return {
      data: tierHistory,
    }
  }

  @ApiRequestData({
    summary: TIER_HISTORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.TIER_HISTORY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: TierHistoryResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: TierHistoryRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const tierHistory = await this.tierHistoryService.update(id, body)

    return {
      data: tierHistory,
    }
  }

  @ApiRequestData({
    summary: TIER_HISTORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.TIER_HISTORY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.DELETE],
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
    const tierHistory = await this.tierHistoryService.find(id)
    if (tierHistory) {
      await this.tierHistoryService.delete(tierHistory, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
