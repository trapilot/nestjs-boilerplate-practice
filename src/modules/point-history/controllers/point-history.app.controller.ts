import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { AuthJwtPayload, ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import {
  ApiRequestData,
  ApiRequestPaging,
  IResponseData,
  IResponsePaging,
  RequestListDto,
  RequestParam,
  RequestQueryList,
} from 'lib/nest-web'
import { POINT_HISTORY_DOC_APP_QUERY_LIST, POINT_HISTORY_DOC_OPERATION } from '../constants'
import { PointHistoryResponseDetailDto, PointHistoryResponseListDto } from '../dtos'
import { PointHistoryService } from '../services'

@ApiTags(POINT_HISTORY_DOC_OPERATION)
@Controller({ version: '1', path: '/point-histories' })
export class PointHistoryAppController {
  constructor(protected readonly pointHistoryService: PointHistoryService) {}

  @ApiRequestPaging({
    summary: POINT_HISTORY_DOC_OPERATION,
    queries: POINT_HISTORY_DOC_APP_QUERY_LIST,
    sortable: true,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: false,
        require: true,
      },
    },
    response: {
      dto: PointHistoryResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'id:desc',
      availableOrderBy: ['id'],
    })
    { _search, _params }: RequestListDto,
    @AuthJwtPayload(['user.id', { parseAs: 'id' }]) memberId: number,
  ): Promise<IResponsePaging> {
    const _where: Prisma.MemberPointHistoryWhereInput = {
      ..._search,
      memberId,
      isVisible: true,
    }
    const _include: Prisma.MemberPointHistoryInclude = {
      invoice: true,
    }

    const pagination = await this.pointHistoryService.paginate(_where, _params, {
      include: _include,
    })
    return pagination
  }

  @ApiRequestData({
    summary: POINT_HISTORY_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
      },
    },
    response: {
      dto: PointHistoryResponseDetailDto,
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
