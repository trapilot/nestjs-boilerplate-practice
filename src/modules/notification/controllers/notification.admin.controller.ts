import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { ENUM_APP_ABILITY_ACTION, ENUM_APP_ABILITY_SUBJECT } from 'app/enums'
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
import { PushHelper } from 'modules/push/helpers'
import { NOTIFICATION_DOC_ADMIN_QUERY_LIST, NOTIFICATION_DOC_OPERATION } from '../constants'
import {
  NotificationRequestCreateDto,
  NotificationRequestUpdateDto,
  NotificationResponseDetailDto,
  NotificationResponseListDto,
} from '../dtos'
import { NotificationService } from '../services'

@ApiTags(NOTIFICATION_DOC_OPERATION)
@Controller({ path: '/notifications' })
export class NotificationAdminController {
  constructor(protected readonly notificationService: NotificationService) {}

  @ApiRequestPaging({
    summary: NOTIFICATION_DOC_OPERATION,
    queries: NOTIFICATION_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.NOTIFICATION,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: NotificationResponseListDto,
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
    const _where: Prisma.NotificationWhereInput = {
      ..._search,
    }
    const _include: Prisma.NotificationInclude = {
      pivotGroups: {
        include: {
          group: true,
        },
      },
      pushes: true,
    }

    const pagination = await this.notificationService.paginate(_where, _params, {
      bookType,
      include: _include,
    })
    return pagination
  }

  @ApiRequestList({
    summary: NOTIFICATION_DOC_OPERATION,
    queries: NOTIFICATION_DOC_ADMIN_QUERY_LIST,
    docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: NotificationResponseListDto,
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
    const _where: Prisma.NotificationWhereInput = {
      ..._search,
    }
    const _select: Prisma.NotificationSelect = {
      id: true,
      title: true,
    }

    const listing = await this.notificationService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: NOTIFICATION_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.NOTIFICATION,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: NotificationResponseDetailDto,
      docExpansion: true,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const notification = await this.notificationService.findOrFail(id, {
      include: {
        pivotGroups: {
          include: {
            group: true,
          },
        },
        pushes: true,
      },
    })

    return {
      data: notification,
    }
  }

  @ApiRequestData({
    summary: NOTIFICATION_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.NOTIFICATION,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: NotificationResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id/inactive')
  async inactive(@RequestParam('id') id: number): Promise<IResponseData> {
    const notification = await this.notificationService.inactive(id)
    return { data: notification }
  }

  @ApiRequestData({
    summary: NOTIFICATION_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.NOTIFICATION,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: NotificationResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id/active')
  async active(@RequestParam('id') id: number): Promise<IResponseData> {
    const notification = await this.notificationService.active(id)
    return { data: notification }
  }

  @ApiRequestData({
    summary: NOTIFICATION_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.NOTIFICATION,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: NotificationResponseDetailDto,
      docExpansion: true,
    },
  })
  @Post('/')
  async create(@RequestBody() body: NotificationRequestCreateDto): Promise<IResponseData> {
    const { pushes, groupIds, ...data } = body
    const notification = await this.notificationService.create({
      ...data,
      pivotGroups: {
        createMany: {
          data: groupIds.map((groupId) => ({ groupId })),
          skipDuplicates: true,
        },
      },
      pushes: {
        createMany: {
          data: PushHelper.makeDtos(pushes),
        },
      },
    })

    return {
      data: notification,
    }
  }

  @ApiRequestData({
    summary: NOTIFICATION_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.NOTIFICATION,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: NotificationResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: NotificationRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const { pushes, groupIds, ...data } = body
    const notification = await this.notificationService.update(id, {
      ...data,
      pivotGroups: {
        createMany: {
          data: groupIds.map((groupId) => ({ groupId })),
          skipDuplicates: true,
        },
      },
      pushes: {
        createMany: {
          data: PushHelper.makeDtos(pushes),
        },
      },
    })

    return {
      data: notification,
    }
  }

  @ApiRequestData({
    summary: NOTIFICATION_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.NOTIFICATION,
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
    const notification = await this.notificationService.find(id)
    if (notification) {
      await this.notificationService.delete(notification, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
