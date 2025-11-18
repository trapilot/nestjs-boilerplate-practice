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
import { APP_VERSION_DOC_ADMIN_QUERY_LIST, APP_VERSION_DOC_OPERATION } from '../constants'
import {
  AppVersionRequestCreateDto,
  AppVersionRequestUpdateDto,
  AppVersionResponseDetailDto,
  AppVersionResponseListDto,
} from '../dtos'
import { AppVersionService } from '../services'

@ApiTags(APP_VERSION_DOC_OPERATION)
@Controller({ path: '/app-versions' })
export class AppVersionAdminController {
  constructor(protected readonly appVersionService: AppVersionService) {}

  @ApiRequestPaging({
    summary: APP_VERSION_DOC_OPERATION,
    queries: APP_VERSION_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.APP_VERSION,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: AppVersionResponseListDto,
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
    const _where: Prisma.AppVersionWhereInput = {
      ..._search,
    }

    const pagination = await this.appVersionService.paginate(_where, _params, {
      bookType,
    })
    return pagination
  }

  @ApiRequestList({
    summary: APP_VERSION_DOC_OPERATION,
    queries: APP_VERSION_DOC_ADMIN_QUERY_LIST,
    docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: AppVersionResponseListDto,
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
    const _where: Prisma.AppVersionWhereInput = {
      ..._search,
    }
    const _select: Prisma.AppVersionSelect = {
      id: true,
    }

    const listing = await this.appVersionService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: APP_VERSION_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.APP_VERSION,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: AppVersionResponseDetailDto,
      docExpansion: true,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const appVersion = await this.appVersionService.findOrFail(id)

    return {
      data: appVersion,
    }
  }

  @ApiRequestData({
    summary: APP_VERSION_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.APP_VERSION,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: AppVersionResponseDetailDto,
      docExpansion: true,
    },
  })
  @Post('/')
  async create(@RequestBody() body: AppVersionRequestCreateDto): Promise<IResponseData> {
    const appVersion = await this.appVersionService.create(body)

    return {
      data: appVersion,
    }
  }

  @ApiRequestData({
    summary: APP_VERSION_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.APP_VERSION,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: AppVersionResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: AppVersionRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const appVersion = await this.appVersionService.update(id, body)

    return {
      data: appVersion,
    }
  }

  @ApiRequestData({
    summary: APP_VERSION_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.APP_VERSION,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: AppVersionResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id/inactive')
  async inactive(@RequestParam('id') id: number): Promise<IResponseData> {
    const appVersion = await this.appVersionService.inactive(id)

    return {
      data: appVersion,
    }
  }

  @ApiRequestData({
    summary: APP_VERSION_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.APP_VERSION,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: AppVersionResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id/active')
  async active(@RequestParam('id') id: number): Promise<IResponseData> {
    const appVersion = await this.appVersionService.active(id)

    return {
      data: appVersion,
    }
  }

  @ApiRequestData({
    summary: APP_VERSION_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.APP_VERSION,
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
    const appVersion = await this.appVersionService.find(id)
    if (appVersion) {
      await this.appVersionService.delete(appVersion, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
