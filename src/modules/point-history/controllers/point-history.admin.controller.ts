import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { AuthJwtPayload, ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
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
  RequestFilterDto,
  RequestListDto,
  RequestParam,
  RequestQueryFilterContain,
  RequestQueryList,
} from 'lib/nest-web'
import { ENUM_APP_ABILITY_ACTION, ENUM_APP_ABILITY_SUBJECT } from 'shared/enums'
import { POINT_HISTORY_DOC_ADMIN_QUERY_LIST, POINT_HISTORY_DOC_OPERATION } from '../constants'
import {
  PointHistoryRequestCreateDto,
  PointHistoryRequestUpdateDto,
  PointHistoryResponseDetailDto,
  PointHistoryResponseListDto,
} from '../dtos'
import { PointHistoryService } from '../services'

@ApiTags(POINT_HISTORY_DOC_OPERATION)
@Controller({ path: '/point-histories' })
export class PointHistoryAdminController {
  constructor(protected readonly pointHistoryService: PointHistoryService) {}

  @ApiRequestPaging({
    summary: POINT_HISTORY_DOC_OPERATION,
    queries: POINT_HISTORY_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.POINT_HISTORY,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: PointHistoryResponseListDto,
      docExpansion: true,
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
    @RequestQueryFilterContain('memberCode', {
      queryField: 'code',
      raw: true,
    })
    rawCode: RequestFilterDto,
    @RequestBookType() bookType: ENUM_FILE_TYPE_EXCEL,
  ): Promise<IResponsePaging> {
    const _where: Prisma.MemberPointHistoryWhereInput = {
      ..._search,
      isVisible: true,
      member: rawCode,
    }
    const _include: Prisma.MemberPointHistoryInclude = {
      tier: true,
      member: true,
      referee: true,
      invoice: true,
    }

    const pagination = await this.pointHistoryService.paginate(_where, _params, {
      bookType,
      include: _include,
    })
    return pagination
  }

  @ApiRequestList({
    summary: POINT_HISTORY_DOC_OPERATION,
    queries: POINT_HISTORY_DOC_ADMIN_QUERY_LIST,
    docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: PointHistoryResponseListDto,
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
    const _where: Prisma.MemberPointHistoryWhereInput = {
      ..._search,
      isVisible: true,
    }
    const _select: Prisma.MemberPointHistorySelect = {
      id: true,
    }

    const listing = await this.pointHistoryService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: POINT_HISTORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.POINT_HISTORY,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: PointHistoryResponseDetailDto,
      docExpansion: true,
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
    summary: POINT_HISTORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.POINT_HISTORY,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: PointHistoryResponseDetailDto,
      docExpansion: true,
    },
  })
  @Post('/')
  async create(@RequestBody() body: PointHistoryRequestCreateDto): Promise<IResponseData> {
    const pointHistory = await this.pointHistoryService.create(body)

    return {
      data: pointHistory,
    }
  }

  @ApiRequestData({
    summary: POINT_HISTORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.POINT_HISTORY,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: PointHistoryResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: PointHistoryRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const pointHistory = await this.pointHistoryService.update(id, body)

    return {
      data: pointHistory,
    }
  }

  @ApiRequestData({
    summary: POINT_HISTORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.POINT_HISTORY,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.DELETE],
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
    const pointHistory = await this.pointHistoryService.find(id)
    if (pointHistory) {
      await this.pointHistoryService.delete(pointHistory, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
