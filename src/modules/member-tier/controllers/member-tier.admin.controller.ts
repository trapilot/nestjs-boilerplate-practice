import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums/user.enum'
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
import {
  MEMBER_TIER_DOC_ADMIN_QUERY_LIST,
  MEMBER_TIER_DOC_OPERATION,
} from '../constants/member-tier.doc.constant'
import { MemberTierRequestCreateDto } from '../dtos/member-tier.request.create.dto'
import { MemberTierRequestUpdateDto } from '../dtos/member-tier.request.update.dto'
import {
  MemberTierResponseDetailDto,
  MemberTierResponseListDto,
} from '../dtos/member-tier.response.detail.dto'
import { MemberTierService } from '../services/member-tier.service'

@ApiTags(MEMBER_TIER_DOC_OPERATION)
@Controller({ path: '/member-tiers' })
export class MemberTierAdminController {
  constructor(protected readonly tierHistoryService: MemberTierService) {}

  @ApiRequestPaging({
    summary: MEMBER_TIER_DOC_OPERATION,
    queries: MEMBER_TIER_DOC_ADMIN_QUERY_LIST,
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
            subject: EnumAuthAbilitySubject.MEMBER_TIER,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: MemberTierResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'isActive:desc|id:desc',
      availableOrderBy: ['id', 'isActive'],
    })
    { _search, _kwargs }: RequestListDto,
    @RequestBookType() bookType: EnumFileExtensionDocument,
  ): Promise<IResponsePaging> {
    const kwargs: Prisma.MemberTierFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
      },
      include: {
        tier: true,
        member: true,
        invoice: true,
      },
    }

    return await this.tierHistoryService.getPage(kwargs, {
      document: bookType,
    })
  }

  @ApiRequestList({
    summary: MEMBER_TIER_DOC_OPERATION,
    queries: MEMBER_TIER_DOC_ADMIN_QUERY_LIST,
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
      dto: MemberTierResponseListDto,
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
    return await this.tierHistoryService.getList({
      ..._kwargs,
      where: { ..._search },
      select: { id: true },
    })
  }

  @ApiRequestData({
    summary: MEMBER_TIER_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.MEMBER_TIER,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: MemberTierResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const tierHistory = await this.tierHistoryService.findOrFail(id, {
      include: {
        tier: true,
        member: true,
        invoice: true,
      },
    })

    return {
      data: tierHistory,
    }
  }

  @ApiRequestData({
    summary: MEMBER_TIER_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.MEMBER_TIER,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: MemberTierResponseDetailDto,
    },
  })
  @Post('/')
  async create(@RequestBody() body: MemberTierRequestCreateDto): Promise<IResponseData> {
    const tierHistory = await this.tierHistoryService.create(body)

    return {
      data: tierHistory,
    }
  }

  @ApiRequestData({
    summary: MEMBER_TIER_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.MEMBER_TIER,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: MemberTierResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: MemberTierRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const tierHistory = await this.tierHistoryService.update(id, body)

    return {
      data: tierHistory,
    }
  }

  @ApiRequestData({
    summary: MEMBER_TIER_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.MEMBER_TIER,
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
    await this.tierHistoryService.delete(id, deletedBy)

    return {
      data: { status: true },
    }
  }
}
