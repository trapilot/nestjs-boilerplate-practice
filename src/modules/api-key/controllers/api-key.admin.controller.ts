import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { EnumApiKeyType, Prisma } from '@runtime/prisma-client'
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
  RequestFilterDto,
  RequestListDto,
  RequestParam,
  RequestQueryFilterInBoolean,
  RequestQueryFilterInEnum,
  RequestQueryList,
} from 'lib/nest-web'
import {
  API_KEY_DOC_ADMIN_QUERY_LIST,
  API_KEY_DOC_OPERATION,
} from '../constants/api-key.doc.constant'
import { ApiKeyRequestCreateDto } from '../dtos/api-key.request.create.dto'
import { ApiKeyRequestRenewDto } from '../dtos/api-key.request.renew.dto'
import { ApiKeyRequestUpdateDto } from '../dtos/api-key.request.update.dto'
import { ApiKeyResponseDetailDto, ApiKeyResponseListDto } from '../dtos/api-key.response.detail.dto'
import { ApiKeyService } from '../services/api-key.service'

@ApiTags(API_KEY_DOC_OPERATION)
@Controller({ path: '/api-keys' })
export class ApiKeyAdminController {
  constructor(protected readonly apiKeyService: ApiKeyService) {}

  @ApiRequestPaging({
    summary: API_KEY_DOC_OPERATION,
    queries: API_KEY_DOC_ADMIN_QUERY_LIST,
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
            subject: EnumAuthAbilitySubject.API_KEY,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: ApiKeyResponseListDto,
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
    @RequestQueryFilterInBoolean('isActive') _enabled: RequestFilterDto,
    @RequestQueryFilterInEnum('type', EnumApiKeyType) _type: RequestFilterDto,
    @RequestBookType() bookType: EnumFileExtensionDocument,
  ): Promise<IResponsePaging> {
    const _where: Prisma.ApiKeyWhereInput = {
      ..._search,
      ..._enabled,
      ..._type,
    }

    const pagination = await this.apiKeyService.paginate(_where, _params, {
      document: bookType,
    })
    return pagination
  }

  @ApiRequestList({
    summary: API_KEY_DOC_OPERATION,
    queries: API_KEY_DOC_ADMIN_QUERY_LIST,
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
      dto: ApiKeyResponseListDto,
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
    const _where: Prisma.ApiKeyWhereInput = {
      ..._search,
    }
    const _select: Prisma.ApiKeySelect = {
      id: true,
    }

    const listing = await this.apiKeyService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: API_KEY_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.API_KEY,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: ApiKeyResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const apiKey = await this.apiKeyService.findOrFail(id)

    return {
      data: apiKey,
    }
  }

  @ApiRequestData({
    summary: API_KEY_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.API_KEY,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: ApiKeyResponseDetailDto,
    },
  })
  @Post('/')
  async create(@RequestBody() body: ApiKeyRequestCreateDto): Promise<IResponseData> {
    const apiKey = await this.apiKeyService.create(body)

    return {
      data: apiKey,
    }
  }

  @ApiRequestData({
    summary: API_KEY_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.API_KEY,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: ApiKeyResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: ApiKeyRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const apiKey = await this.apiKeyService.update(id, body)

    return {
      data: apiKey,
    }
  }

  @ApiRequestData({
    summary: API_KEY_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.API_KEY,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: ApiKeyResponseDetailDto,
    },
  })
  @Patch('/:id/reset')
  async reset(@RequestParam('id') id: number): Promise<IResponseData> {
    const apiKey = await this.apiKeyService.reset(id)

    return {
      data: apiKey,
    }
  }

  @ApiRequestData({
    summary: API_KEY_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.API_KEY,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: ApiKeyResponseDetailDto,
    },
  })
  @Patch('/:id/renew')
  async renew(
    @RequestBody() body: ApiKeyRequestRenewDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const _apiKey = await this.apiKeyService.findOrFail(id)
    const apiKey = await this.apiKeyService.renew(_apiKey, {
      startDate: body?.startDate || _apiKey.startDate,
      untilDate: body.untilDate,
    })

    return {
      data: apiKey,
    }
  }

  @ApiRequestData({
    summary: API_KEY_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.API_KEY,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: ApiKeyResponseDetailDto,
    },
  })
  @Put('/:id/inactive')
  async inactive(@RequestParam('id') id: number): Promise<IResponseData> {
    const apiKey = await this.apiKeyService.inactive(id)

    return {
      data: apiKey,
    }
  }

  @ApiRequestData({
    summary: API_KEY_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.API_KEY,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: ApiKeyResponseDetailDto,
    },
  })
  @Put('/:id/active')
  async active(@RequestParam('id') id: number): Promise<IResponseData> {
    const apiKey = await this.apiKeyService.active(id)

    return {
      data: apiKey,
    }
  }

  @ApiRequestData({
    summary: API_KEY_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.API_KEY,
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
    const apiKey = await this.apiKeyService.find(id)
    if (apiKey) {
      await this.apiKeyService.delete(apiKey, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
