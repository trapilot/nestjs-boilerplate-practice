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
  RequestListDto,
  RequestParam,
  RequestQueryList,
} from 'lib/nest-web'
import { ENUM_APP_ABILITY_ACTION, ENUM_APP_ABILITY_SUBJECT } from 'shared/enums'
import {
  NOTIFICATION_HISTORY_DOC_ADMIN_QUERY_LIST,
  NOTIFICATION_HISTORY_DOC_OPERATION,
} from '../constants'
import {
  NotificationHistoryRequestCreateDto,
  NotificationHistoryRequestUpdateDto,
  NotificationHistoryResponseDetailDto,
  NotificationHistoryResponseListDto,
} from '../dtos'
import { NotificationHistoryService } from '../services'

@ApiTags(NOTIFICATION_HISTORY_DOC_OPERATION)
@Controller({ path: '/notification-histories' })
export class NotificationHistoryAdminController {
  constructor(protected readonly notificationHistoryService: NotificationHistoryService) {}

  @ApiRequestPaging({
    summary: NOTIFICATION_HISTORY_DOC_OPERATION,
    queries: NOTIFICATION_HISTORY_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.NOTIFICATION_HISTORY,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: NotificationHistoryResponseListDto,
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
    @RequestBookType() bookType: ENUM_FILE_TYPE_EXCEL,
  ): Promise<IResponsePaging> {
    const _where: Prisma.MemberNotifyHistoryWhereInput = {
      ..._search,
    }

    const pagination = await this.notificationHistoryService.paginate(_where, _params, {
      bookType,
    })
    return pagination
  }

  @ApiRequestList({
    summary: NOTIFICATION_HISTORY_DOC_OPERATION,
    queries: NOTIFICATION_HISTORY_DOC_ADMIN_QUERY_LIST,
    docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: NotificationHistoryResponseListDto,
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
    const _where: Prisma.MemberNotifyHistoryWhereInput = {
      ..._search,
    }
    const _select: Prisma.MemberNotifyHistorySelect = {
      id: true,
    }

    const listing = await this.notificationHistoryService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: NOTIFICATION_HISTORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.NOTIFICATION_HISTORY,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: NotificationHistoryResponseDetailDto,
      docExpansion: true,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const notificationHistory = await this.notificationHistoryService.findOrFail(id)

    return {
      data: notificationHistory,
    }
  }

  @ApiRequestData({
    summary: NOTIFICATION_HISTORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.NOTIFICATION_HISTORY,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: NotificationHistoryResponseDetailDto,
      docExpansion: true,
    },
  })
  @Post('/')
  async create(@RequestBody() body: NotificationHistoryRequestCreateDto): Promise<IResponseData> {
    const notificationHistory = await this.notificationHistoryService.create(body)

    return {
      data: notificationHistory,
    }
  }

  @ApiRequestData({
    summary: NOTIFICATION_HISTORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.NOTIFICATION_HISTORY,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: NotificationHistoryResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: NotificationHistoryRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const notificationHistory = await this.notificationHistoryService.update(id, body)

    return {
      data: notificationHistory,
    }
  }

  @ApiRequestData({
    summary: NOTIFICATION_HISTORY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.NOTIFICATION_HISTORY,
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
    const notificationHistory = await this.notificationHistoryService.find(id)
    if (notificationHistory) {
      await this.notificationHistoryService.delete(notificationHistory, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
