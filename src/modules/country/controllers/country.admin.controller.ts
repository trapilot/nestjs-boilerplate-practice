import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums/user.enum'
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
import {
  COUNTRY_DOC_ADMIN_QUERY_LIST,
  COUNTRY_DOC_OPERATION,
} from '../constants/country.doc.constant'
import { CountryRequestCreateDto } from '../dtos/country.request.create.dto'
import { CountryRequestUpdateDto } from '../dtos/country.request.update.dto'
import {
  CountryResponseDetailDto,
  CountryResponseListDto,
} from '../dtos/country.response.detail.dto'
import { CountryService } from '../services/country.service'

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
    { _search, _kwargs }: RequestListDto,
    @RequestBookType() bookType: EnumFileExtensionDocument,
  ): Promise<IResponsePaging> {
    const kwargs: Prisma.CountryFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
        isVisible: true,
      },
    }

    return await this.countryService.getPage(kwargs, {
      document: bookType,
    })
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
    { _search, _kwargs }: RequestListDto,
  ): Promise<IResponseList> {
    return await this.countryService.getList({
      ..._kwargs,
      where: { ..._search, isVisible: true },
      select: { id: true, name: true },
    })
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
    await this.countryService.delete(id, deletedBy)

    return {
      data: { status: true },
    }
  }
}
