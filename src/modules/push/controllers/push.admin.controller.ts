import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
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
import { PUSH_DOC_ADMIN_QUERY_LIST, PUSH_DOC_OPERATION } from '../constants'
import {
  PushRequestCreateDto,
  PushRequestUpdateDto,
  PushResponseDetailDto,
  PushResponseListDto,
} from '../dtos'
import { PushService } from '../services'

@ApiTags(PUSH_DOC_OPERATION)
@Controller({ path: '/pushes' })
export class PushAdminController {
  constructor(protected readonly pushService: PushService) {}

  @ApiRequestPaging({
    summary: PUSH_DOC_OPERATION,
    queries: PUSH_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PUSH,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: PushResponseListDto,
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
    const _where: Prisma.PushWhereInput = {
      ..._search,
    }

    const pagination = await this.pushService.paginate(_where, _params, {
      bookType,
    })
    return pagination
  }

  @ApiRequestList({
    summary: PUSH_DOC_OPERATION,
    queries: PUSH_DOC_ADMIN_QUERY_LIST,
    sortable: false,
    searchable: false,
    exportable: false,
    docExclude: true,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: PushResponseListDto,
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
    const _where: Prisma.PushWhereInput = {
      ..._search,
    }
    const _select: Prisma.PushSelect = {
      id: true,
      notificationId: true,
    }

    const listing = await this.pushService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: PUSH_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PUSH,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: PushResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const push = await this.pushService.findOrFail(id)

    return {
      data: push,
    }
  }
  @ApiRequestData({
    summary: PUSH_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PUSH,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: PushResponseDetailDto,
    },
  })
  @Put('/:id/inactive')
  async inactive(@RequestParam('id') id: number): Promise<IResponseData> {
    const member = await this.pushService.inactive(id)
    return { data: member }
  }

  @ApiRequestData({
    summary: PUSH_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PUSH,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: PushResponseDetailDto,
    },
  })
  @Put('/:id/active')
  async active(@RequestParam('id') id: number): Promise<IResponseData> {
    const member = await this.pushService.active(id)
    return { data: member }
  }

  @ApiRequestData({
    summary: PUSH_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PUSH,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: PushResponseDetailDto,
    },
  })
  @Post('/')
  async create(@RequestBody() body: PushRequestCreateDto): Promise<IResponseData> {
    const push = await this.pushService.create(body)

    return {
      data: push,
    }
  }

  @ApiRequestData({
    summary: PUSH_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PUSH,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: PushResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: PushRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const push = await this.pushService.update(id, body)

    return {
      data: push,
    }
  }

  @ApiRequestData({
    summary: PUSH_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.PUSH,
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
    const push = await this.pushService.find(id)
    if (push) {
      await this.pushService.delete(push, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
