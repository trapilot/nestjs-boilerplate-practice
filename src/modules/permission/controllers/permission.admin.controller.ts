import { Controller, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import {
  AuthJwtPayload,
  ENUM_AUTH_ABILITY_ACTION,
  ENUM_AUTH_ABILITY_SUBJECT,
  ENUM_AUTH_SCOPE_TYPE,
} from 'lib/nest-auth'
import {
  ApiRequestData,
  ApiRequestList,
  IResponseData,
  IResponseList,
  RequestBody,
  RequestFilterDto,
  RequestListDto,
  RequestParam,
  RequestQueryFilterInBoolean,
  RequestQueryList,
} from 'lib/nest-web'
import { PERMISSION_DOC_OPERATION } from '../constants'
import {
  PermissionRequestCreateDto,
  PermissionRequestUpdateDto,
  PermissionResponseDetailDto,
  PermissionResponseListDto,
} from '../dtos'
import { PermissionService } from '../services'

@ApiTags(PERMISSION_DOC_OPERATION)
@Controller({ path: '/permissions' })
export class PermissionAdminController {
  constructor(protected readonly permissionService: PermissionService) {}

  @ApiRequestList({
    summary: PERMISSION_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PERMISSION,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: PermissionResponseListDto,
      docExpansion: true,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultOrderBy: 'sorting:asc',
      availableOrderBy: ['sorting'],
    })
    { _search, _params }: RequestListDto,
    @RequestQueryFilterInBoolean('isActive', true) _enabled: RequestFilterDto,
    @RequestQueryFilterInBoolean('isVisible', true) _visible: RequestFilterDto,
  ): Promise<IResponseList> {
    const _where: Prisma.PermissionWhereInput = {
      ..._search,
      ..._enabled,
      ..._visible,
    }
    const listing = await this.permissionService.list(_where, _params)
    return listing
  }

  @ApiRequestData({
    summary: PERMISSION_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PERMISSION,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    docExclude: true,
    response: {
      dto: PermissionResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: PermissionRequestUpdateDto,
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') updatedBy: number,
  ): Promise<IResponseData> {
    const { actions, ...data } = body
    const updated = await this.permissionService.update(id, { ...data, updatedBy }, { actions })
    return { data: updated }
  }

  @ApiRequestData({
    summary: PERMISSION_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.PERMISSION,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    docExclude: true,
    response: {
      dto: PermissionResponseDetailDto,
      docExpansion: true,
    },
  })
  @Post('/')
  async create(
    @RequestBody() body: PermissionRequestCreateDto,
    @AuthJwtPayload('user.id') createdBy: number,
  ): Promise<IResponseData> {
    const { actions, ...data } = body
    const created = await this.permissionService.create({ ...data, createdBy }, { actions })
    return { data: created }
  }
}
