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
  RequestFilterDto,
  RequestListDto,
  RequestParam,
  RequestQueryFilterContain,
  RequestQueryList,
} from 'lib/nest-web'
import {
  MEMBER_POINT_DOC_ADMIN_QUERY_LIST,
  MEMBER_POINT_DOC_OPERATION,
} from '../constants/member-point.doc.constant'
import { MemberPointRequestCreateDto } from '../dtos/member-point.request.create.dto'
import { MemberPointRequestUpdateDto } from '../dtos/member-point.request.update.dto'
import {
  MemberPointResponseDetailDto,
  MemberPointResponseListDto,
} from '../dtos/member-point.response.detail.dto'
import { MemberPointService } from '../services/member-point.service'

@ApiTags(MEMBER_POINT_DOC_OPERATION)
@Controller({ path: '/member-points' })
export class MemberPointAdminController {
  constructor(protected readonly pointHistoryService: MemberPointService) {}

  @ApiRequestPaging({
    summary: MEMBER_POINT_DOC_OPERATION,
    queries: MEMBER_POINT_DOC_ADMIN_QUERY_LIST,
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
            subject: EnumAuthAbilitySubject.MEMBER_POINT,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: MemberPointResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'id:desc',
      availableOrderBy: ['id'],
    })
    { _search, _kwargs }: RequestListDto,
    @RequestQueryFilterContain('memberCode', {
      queryField: 'code',
      raw: true,
    })
    rawCode: RequestFilterDto,
    @RequestBookType() bookType: EnumFileExtensionDocument,
  ): Promise<IResponsePaging> {
    const kwargs: Prisma.MemberPointFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
        isVisible: true,
        member: rawCode,
      },
      include: {
        tier: true,
        member: true,
        referee: true,
        invoice: true,
      },
    }

    return await this.pointHistoryService.getPage(kwargs, {
      document: bookType,
    })
  }

  @ApiRequestList({
    summary: MEMBER_POINT_DOC_OPERATION,
    queries: MEMBER_POINT_DOC_ADMIN_QUERY_LIST,
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
      dto: MemberPointResponseListDto,
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
    return await this.pointHistoryService.getList({
      ..._kwargs,
      where: { ..._search, isVisible: true },
      select: { id: true },
    })
  }

  @ApiRequestData({
    summary: MEMBER_POINT_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.MEMBER_POINT,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: MemberPointResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const pointHistory = await this.pointHistoryService.findOrFail(id, {
      include: {
        tier: true,
        member: true,
        referee: true,
        invoice: true,
      },
    })

    return {
      data: pointHistory,
    }
  }

  @ApiRequestData({
    summary: MEMBER_POINT_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.MEMBER_POINT,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: MemberPointResponseDetailDto,
    },
  })
  @Post('/')
  async create(@RequestBody() body: MemberPointRequestCreateDto): Promise<IResponseData> {
    const pointHistory = await this.pointHistoryService.create(body)

    return {
      data: pointHistory,
    }
  }

  @ApiRequestData({
    summary: MEMBER_POINT_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.MEMBER_POINT,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: MemberPointResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: MemberPointRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const pointHistory = await this.pointHistoryService.update(id, body)

    return {
      data: pointHistory,
    }
  }

  @ApiRequestData({
    summary: MEMBER_POINT_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.MEMBER_POINT,
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
    await this.pointHistoryService.delete(id, deletedBy)

    return {
      data: { status: true },
    }
  }
}
