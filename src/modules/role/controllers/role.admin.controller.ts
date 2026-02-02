import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums/user.enum'
import { AuthJwtPayload, EnumAuthScopeType } from 'lib/nest-auth'
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
import { ROLE_DOC_ADMIN_QUERY_LIST, ROLE_DOC_OPERATION } from '../constants/role.doc.constant'
import { RequestRoleLevel } from '../decorators/role.level.decorator'
import { RoleRequestCreateDto } from '../dtos/role.request.create.dto'
import { RoleRequestUpdateDto } from '../dtos/role.request.update.dto'
import { RoleResponseDetailDto, RoleResponseListDto } from '../dtos/role.response.detail.dto'
import { RoleLimitedLevelPipe } from '../pipes/role.limited-level.pipe'
import { RoleNotSelfPipe } from '../pipes/role.not-self.pipe'
import { RoleService } from '../services/role.service'

@ApiTags(ROLE_DOC_OPERATION)
@Controller({ path: '/roles' })
export class RoleAdminController {
  constructor(protected readonly roleService: RoleService) {}

  @ApiRequestPaging({
    summary: ROLE_DOC_OPERATION,
    queries: ROLE_DOC_ADMIN_QUERY_LIST,
    sortable: false,
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
            subject: EnumAuthAbilitySubject.ROLE,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: RoleResponseListDto,
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
    sortable: false,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: RoleResponseListDto,
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
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.ROLE,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: RoleResponseDetailDto,
    },
  })
  @Get('/new')
  async new(): Promise<IResponseData> {
    const [role, permissions] = await this.roleService.getWithAllPerms()
    return {
      data: {
        role,
        fullPermissions: permissions,
      },
    }
  }

  @ApiRequestData({
    summary: ROLE_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.ROLE,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: RoleResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id', RoleLimitedLevelPipe) id: number): Promise<IResponseData> {
    const [role, permissions] = await this.roleService.getWithAllPerms(id)
    return {
      data: {
        role,
        fullPermissions: permissions,
      },
    }
  }

  @ApiRequestData({
    summary: ROLE_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.ROLE,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: RoleResponseDetailDto,
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
            subject: EnumAuthAbilitySubject.ROLE,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: RoleResponseDetailDto,
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
            subject: EnumAuthAbilitySubject.ROLE,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.DELETE],
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
            subject: EnumAuthAbilitySubject.ROLE,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: RoleResponseDetailDto,
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
            subject: EnumAuthAbilitySubject.ROLE,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: RoleResponseDetailDto,
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
