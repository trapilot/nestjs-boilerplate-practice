import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { AuthJwtPayload, EnumAuthScopeType } from 'lib/nest-auth'
import { EnumFileExtensionDocument } from 'lib/nest-core'
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
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'shared/enums'
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
            subject: EnumAuthAbilitySubject.TIER_HISTORY,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: TierHistoryResponseListDto,
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
    @RequestBookType() bookType: EnumFileExtensionDocument
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
      document: bookType,
      include: _include,
    })
    return pagination
  }

  @ApiRequestList({
    summary: TIER_HISTORY_DOC_OPERATION,
    queries: TIER_HISTORY_DOC_ADMIN_QUERY_LIST,
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
      dto: TierHistoryResponseListDto,
    },
  })
  @Get('/map-shorted')
  async mapShorted(
    @RequestQueryList({
      defaultOrderBy: 'name:asc',
      availableOrderBy: ['name'],
    })
    { _search, _params }: RequestListDto
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
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.TIER_HISTORY,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: TierHistoryResponseDetailDto,
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
            subject: EnumAuthAbilitySubject.TIER_HISTORY,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: TierHistoryResponseDetailDto,
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
            subject: EnumAuthAbilitySubject.TIER_HISTORY,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: TierHistoryResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: TierHistoryRequestUpdateDto,
    @RequestParam('id') id: number
  ): Promise<IResponseData> {
    const tierHistory = await this.tierHistoryService.update(id, body)

    return {
      data: tierHistory,
    }
  }

  @ApiRequestData({
    summary: TIER_HISTORY_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.TIER_HISTORY,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.DELETE],
          },
        ],
      },
    },
  })
  @Delete('/:id')
  async delete(
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') deletedBy: number
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
