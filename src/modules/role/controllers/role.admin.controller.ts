import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { AuthJwtPayload, ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import {
  ApiRequestData,
  ApiRequestList,
  ApiRequestPaging,
  IResponseData,
  IResponseList,
  IResponsePaging,
  RequestBody,
  RequestFilterDto,
  RequestListDto,
  RequestParam,
  RequestQueryFilterInBoolean,
  RequestQueryList,
} from 'lib/nest-web'
import { PermissionService } from 'modules/permission/services'
import { ENUM_APP_ABILITY_ACTION, ENUM_APP_ABILITY_SUBJECT } from 'shared/enums'
import { ROLE_DOC_ADMIN_QUERY_LIST, ROLE_DOC_OPERATION } from '../constants'
import { RequestRoleLevel } from '../decorators'
import {
  RoleRequestCreateDto,
  RoleRequestUpdateDto,
  RoleResponseDetailDto,
  RoleResponseListDto,
} from '../dtos'
import { TRole } from '../interfaces'
import { RoleLimitedLevelPipe, RoleNotSelfPipe } from '../pipes'
import { RoleService } from '../services'

@ApiTags(ROLE_DOC_OPERATION)
@Controller({ path: '/roles' })
export class RoleAdminController {
  constructor(
    protected readonly roleService: RoleService,
    protected readonly permissionService: PermissionService,
  ) {}

  @ApiRequestPaging({
    summary: ROLE_DOC_OPERATION,
    queries: ROLE_DOC_ADMIN_QUERY_LIST,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.ROLE,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: RoleResponseListDto,
      docExpansion: true,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'id',
      availableOrderBy: ['id'],
    })
    { _search, _params }: RequestListDto,
    @RequestQueryFilterInBoolean('isActive') _enabled: RequestFilterDto,
    @RequestRoleLevel() _level: RequestFilterDto,
  ): Promise<IResponsePaging> {
    const _where: Prisma.RoleWhereInput = {
      ..._search,
      ..._enabled,
      ..._level,
    }

    const pagination = await this.roleService.paginate(_where, _params)
    return pagination
  }

  @ApiRequestList({
    summary: ROLE_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: RoleResponseListDto,
      docExpansion: true,
    },
  })
  @Get('/map-shorted')
  async mapShorted(
    @RequestQueryList({
      defaultOrderBy: 'title:asc',
      availableOrderBy: ['title'],
    })
    { _search, _params }: RequestListDto,
    @RequestQueryFilterInBoolean('isActive', true) _enabled: RequestFilterDto,
    @RequestRoleLevel() _level: RequestFilterDto,
  ): Promise<IResponseList> {
    const _where: Prisma.RoleWhereInput = {
      ..._search,
      ..._enabled,
      ..._level,
    }
    const _select: Prisma.RoleSelect = {
      id: true,
      title: true,
    }

    const listing = await this.roleService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: ROLE_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.ROLE,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: RoleResponseDetailDto,
      docExpansion: true,
    },
  })
  @Get('/new')
  async new(): Promise<IResponseData<TRole>> {
    const [role, fullPermissions] = await Promise.all([
      this.roleService.fakeNew(),
      this.permissionService.findAll({
        where: { isActive: true },
        orderBy: [{ sorting: 'asc' }],
      }),
    ])
    return {
      data: Object.assign({}, role, { fullPermissions }),
    }
  }

  @ApiRequestData({
    summary: ROLE_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.ROLE,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: RoleResponseDetailDto,
      docExpansion: true,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id', RoleLimitedLevelPipe) id: number): Promise<IResponseData> {
    const [role, fullPermissions] = await Promise.all([
      this.roleService.findOrFail(id, {
        include: {
          pivotPermissions: true,
        },
      }),
      this.permissionService.findAll({
        where: { isActive: true },
        orderBy: [{ sorting: 'asc' }],
      }),
    ])
    return {
      data: Object.assign({}, role, { fullPermissions }),
    }
  }

  @ApiRequestData({
    summary: ROLE_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.ROLE,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: RoleResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: RoleRequestUpdateDto,
    @RequestParam('id', RoleNotSelfPipe, RoleLimitedLevelPipe) id: number,
    @AuthJwtPayload('user.id') updatedBy: number,
  ): Promise<IResponseData> {
    const { permissions, ...dto } = body
    const data = { ...dto, updatedBy }
    const updated = await this.roleService.update(id, data, {
      permissions,
    })

    return { data: updated }
  }

  @ApiRequestData({
    summary: ROLE_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.ROLE,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: RoleResponseDetailDto,
      docExpansion: true,
    },
  })
  @Post('/')
  async create(
    @RequestBody() body: RoleRequestCreateDto,
    @AuthJwtPayload('user.id') createdBy: number,
  ): Promise<IResponseData> {
    const { permissions, ...data } = body
    const created = await this.roleService.create({ ...data, createdBy }, { permissions })
    return { data: created }
  }

  @ApiRequestData({
    summary: ROLE_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.ROLE,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.DELETE],
          },
        ],
      },
    },
  })
  @Delete('/:id')
  async delete(@RequestParam('id', RoleLimitedLevelPipe) id: number): Promise<IResponseData> {
    await this.roleService.delete(id)

    return { data: { status: true } }
  }

  @ApiRequestData({
    summary: ROLE_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.ROLE,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: RoleResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id/active')
  async active(
    @RequestParam('id', RoleLimitedLevelPipe) id: number,
    @AuthJwtPayload('user.id') updatedBy: number,
  ): Promise<IResponseData> {
    const updated = await this.roleService.change(id, {
      isActive: true,
      updatedBy,
    })

    return { data: updated }
  }

  @ApiRequestData({
    summary: ROLE_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.ROLE,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: RoleResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id/inactive')
  async inactive(
    @RequestParam('id', RoleNotSelfPipe, RoleLimitedLevelPipe) id: number,
    @AuthJwtPayload('user.id') updatedBy: number,
  ): Promise<IResponseData> {
    const updated = await this.roleService.change(id, {
      isActive: false,
      updatedBy,
    })

    return { data: updated }
  }
}
