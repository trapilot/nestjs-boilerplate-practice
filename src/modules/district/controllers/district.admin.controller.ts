import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { AuthJwtPayload, EnumAuthScopeType } from 'lib/nest-auth'
import { EnumFileExtensionDocument } from 'lib/nest-core'
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
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'shared/enums'
import { DISTRICT_DOC_ADMIN_QUERY_LIST, DISTRICT_DOC_OPERATION } from '../constants'
import {
  DistrictRequestCreateDto,
  DistrictRequestUpdateDto,
  DistrictResponseDetailDto,
  DistrictResponseListDto,
} from '../dtos'
import { DistrictService } from '../services'

@ApiTags(DISTRICT_DOC_OPERATION)
@Controller({ path: '/districts' })
export class DistrictAdminController {
  constructor(protected readonly districtService: DistrictService) {}

  @ApiRequestPaging({
    summary: DISTRICT_DOC_OPERATION,
    queries: DISTRICT_DOC_ADMIN_QUERY_LIST,
    sortable: true,
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
            subject: EnumAuthAbilitySubject.DISTRICT,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: DistrictResponseListDto,
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
    @RequestBookType() bookType: EnumFileExtensionDocument
  ): Promise<IResponsePaging> {
    const _where: Prisma.DistrictWhereInput = {
      ..._search,
      isVisible: true,
    }

    const pagination = await this.districtService.paginate(_where, _params, {
      document: bookType,
    })
    return pagination
  }

  @ApiRequestList({
    summary: DISTRICT_DOC_OPERATION,
    queries: DISTRICT_DOC_ADMIN_QUERY_LIST,
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
      dto: DistrictResponseListDto,
    },
  })
  @Get('/map-shorted')
  async mapShorted(
    @RequestQueryList({
      defaultOrderBy: 'name:asc',
      availableOrderBy: ['name'],
    })
    { _search, _params }: RequestListDto
  ): Promise<IResponseList> {
    const _where: Prisma.DistrictWhereInput = {
      ..._search,
      isVisible: true,
    }
    const _select: Prisma.DistrictSelect = {
      id: true,
      name: true,
    }

    const listing = await this.districtService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: DISTRICT_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.DISTRICT,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: DistrictResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const district = await this.districtService.findOrFail(id)

    return {
      data: district,
    }
  }

  @ApiRequestData({
    summary: DISTRICT_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.DISTRICT,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: DistrictResponseDetailDto,
    },
  })
  @Post('/')
  async create(@RequestBody() body: DistrictRequestCreateDto): Promise<IResponseData> {
    const district = await this.districtService.create(body)

    return {
      data: district,
    }
  }

  @ApiRequestData({
    summary: DISTRICT_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.DISTRICT,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: DistrictResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: DistrictRequestUpdateDto,
    @RequestParam('id') id: number
  ): Promise<IResponseData> {
    const district = await this.districtService.update(id, body)

    return {
      data: district,
    }
  }

  @ApiRequestData({
    summary: DISTRICT_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.DISTRICT,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.DELETE],
          },
        ],
      },
    },
  })
  @Delete('/:id')
  async delete(
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') deletedBy: number
  ): Promise<IResponseData> {
    const district = await this.districtService.find(id)
    if (district) {
      await this.districtService.delete(district, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
