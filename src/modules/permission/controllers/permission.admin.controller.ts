import { Controller, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums'
import { UserAbilityUtil } from 'app/helpers'
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
import { PERMISSION_DOC_ADMIN_QUERY_LIST, PERMISSION_DOC_OPERATION } from '../constants'
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
