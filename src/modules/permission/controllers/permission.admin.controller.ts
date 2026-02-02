import { Controller, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums/user.enum'
import { UserAbilityUtil } from 'app/helpers/user.ability.util'
import { AuthJwtPayload, EnumAuthScopeType } from 'lib/nest-auth'
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
import {
  PERMISSION_DOC_ADMIN_QUERY_LIST,
  PERMISSION_DOC_OPERATION,
} from '../constants/permission.doc.constant'
import { PermissionRequestCreateDto } from '../dtos/permission.request.create.dto'
import { PermissionRequestUpdateDto } from '../dtos/permission.request.update.dto'
import {
  PermissionResponseDetailDto,
  PermissionResponseListDto,
} from '../dtos/permission.response.detail.dto'
import { PermissionService } from '../services/permission.service'

@ApiTags(PERMISSION_DOC_OPERATION)
@Controller({ path: '/permissions' })
export class PermissionAdminController {
  constructor(protected readonly permissionService: PermissionService) {}

  @ApiRequestList({
    summary: PERMISSION_DOC_OPERATION,
    queries: PERMISSION_DOC_ADMIN_QUERY_LIST,
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
            subject: EnumAuthAbilitySubject.PERMISSION,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: PermissionResponseListDto,
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
    docExclude: true,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.PERMISSION,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: PermissionResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const permission = await this.permissionService.findOrFail(id)
    return { data: permission }
  }

  @ApiRequestData({
    summary: PERMISSION_DOC_OPERATION,
    docExclude: true,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.PERMISSION,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: PermissionResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: PermissionRequestUpdateDto,
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') updatedBy: number,
  ): Promise<IResponseData> {
    const { actions, ...dto } = body

    const data: Prisma.PermissionUncheckedUpdateInput = {
      ...dto,
      updatedBy,
      bitwise: UserAbilityUtil.map2Bitwise(actions),
    }

    const updated = await this.permissionService.update(id, data)

    return { data: updated }
  }

  @ApiRequestData({
    summary: PERMISSION_DOC_OPERATION,
    docExclude: true,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.PERMISSION,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: PermissionResponseDetailDto,
    },
  })
  @Post('/')
  async create(
    @RequestBody() body: PermissionRequestCreateDto,
    @AuthJwtPayload('user.id') createdBy: number,
  ): Promise<IResponseData> {
    const { actions, ...dto } = body
    const data: Prisma.PermissionUncheckedCreateInput = {
      ...dto,
      createdBy,
      bitwise: UserAbilityUtil.map2Bitwise(actions),
    }

    const created = await this.permissionService.create(data)
    return { data: created }
  }
}
