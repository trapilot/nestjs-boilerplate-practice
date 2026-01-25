import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums'
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
import { COUNTRY_DOC_ADMIN_QUERY_LIST, COUNTRY_DOC_OPERATION } from '../constants'
import {
  CountryRequestCreateDto,
  CountryRequestUpdateDto,
  CountryResponseDetailDto,
  CountryResponseListDto,
} from '../dtos'
import { CountryService } from '../services'

@ApiTags(COUNTRY_DOC_OPERATION)
@Controller({ path: '/countries' })
export class CountryAdminController {
  constructor(protected readonly countryService: CountryService) {}

  @ApiRequestPaging({
    summary: COUNTRY_DOC_OPERATION,
    queries: COUNTRY_DOC_ADMIN_QUERY_LIST,
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
            subject: EnumAuthAbilitySubject.COUNTRY,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: CountryResponseListDto,
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
    @RequestBookType() bookType: EnumFileExtensionDocument,
  ): Promise<IResponsePaging> {
    const _where: Prisma.CountryWhereInput = {
      ..._search,
      isVisible: true,
    }

    const pagination = await this.countryService.paginate(_where, _params, {
      document: bookType,
    })
    return pagination
  }

  @ApiRequestList({
    summary: COUNTRY_DOC_OPERATION,
    queries: COUNTRY_DOC_ADMIN_QUERY_LIST,
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
      dto: CountryResponseListDto,
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
    const _where: Prisma.CountryWhereInput = {
      ..._search,
      isVisible: true,
    }
    const _select: Prisma.CountrySelect = {
      id: true,
      name: true,
    }

    const listing = await this.countryService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: COUNTRY_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.COUNTRY,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: CountryResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const country = await this.countryService.findOrFail(id)

    return {
      data: country,
    }
  }

  @ApiRequestData({
    summary: COUNTRY_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.COUNTRY,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: CountryResponseDetailDto,
    },
  })
  @Post('/')
  async create(@RequestBody() body: CountryRequestCreateDto): Promise<IResponseData> {
    const country = await this.countryService.create(body)

    return {
      data: country,
    }
  }

  @ApiRequestData({
    summary: COUNTRY_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.COUNTRY,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: CountryResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: CountryRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const country = await this.countryService.update(id, body)

    return {
      data: country,
    }
  }

  @ApiRequestData({
    summary: COUNTRY_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.COUNTRY,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.DELETE],
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
    const country = await this.countryService.find(id)
    if (country) {
      await this.countryService.delete(country, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
