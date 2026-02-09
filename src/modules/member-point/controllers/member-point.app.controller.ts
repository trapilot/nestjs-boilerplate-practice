import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { AuthJwtPayload, EnumAuthScopeType } from 'lib/nest-auth'
import {
  ApiRequestData,
  ApiRequestPaging,
  IResponseData,
  IResponsePaging,
  RequestListDto,
  RequestParam,
  RequestQueryList,
} from 'lib/nest-web'
import {
  MEMBER_POINT_DOC_APP_QUERY_LIST,
  MEMBER_POINT_DOC_OPERATION,
} from '../constants/member-point.doc.constant'
import {
  MemberPointResponseDetailDto,
  MemberPointResponseListDto,
} from '../dtos/member-point.response.detail.dto'
import { MemberPointService } from '../services/member-point.service'

@ApiTags(MEMBER_POINT_DOC_OPERATION)
@Controller({ version: '1', path: '/member-points' })
export class MemberPointAppController {
  constructor(protected readonly pointHistoryService: MemberPointService) {}

  @ApiRequestPaging({
    summary: MEMBER_POINT_DOC_OPERATION,
    queries: MEMBER_POINT_DOC_APP_QUERY_LIST,
    sortable: true,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.MEMBER,
      user: {
        synchronize: false,
        require: true,
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
    @AuthJwtPayload(['user.id', { parseAs: 'id' }]) memberId: number,
  ): Promise<IResponsePaging> {
    const kwargs: Prisma.MemberPointFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
        memberId,
        isVisible: true,
      },
      include: {
        invoice: true,
      },
    }

    return await this.pointHistoryService.getPage(kwargs)
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
        invoice: true,
      },
    })

    return {
      data: pointHistory,
    }
  }
}
