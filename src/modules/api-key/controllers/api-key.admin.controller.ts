import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ENUM_API_KEY_TYPE, Prisma } from '@prisma/client'
import {
  AuthJwtPayload,
  ENUM_AUTH_ABILITY_ACTION,
  ENUM_AUTH_ABILITY_SUBJECT,
  ENUM_AUTH_SCOPE_TYPE,
} from 'lib/nest-auth'
import { ENUM_FILE_TYPE_EXCEL } from 'lib/nest-file'
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
import { API_KEY_DOC_ADMIN_QUERY_LIST, API_KEY_DOC_OPERATION } from '../constants'
import {
  ApiKeyRequestCreateDto,
  ApiKeyRequestRenewDto,
  ApiKeyRequestUpdateDto,
  ApiKeyResponseDetailDto,
  ApiKeyResponseListDto,
} from '../dtos'
import { ApiKeyService } from '../services'

@ApiTags(API_KEY_DOC_OPERATION)
@Controller({ path: '/api-keys' })
export class ApiKeyAdminController {
  constructor(protected readonly apiKeyService: ApiKeyService) {}

  @ApiRequestPaging({
    summary: API_KEY_DOC_OPERATION,
    queries: API_KEY_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.API_KEY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: ApiKeyResponseListDto,
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
    @RequestQueryFilterInBoolean('isActive') _enabled: RequestFilterDto,
    @RequestQueryFilterInEnum('type', ENUM_API_KEY_TYPE) _type: RequestFilterDto,
    @RequestBookType() bookType: ENUM_FILE_TYPE_EXCEL,
  ): Promise<IResponsePaging> {
    const _where: Prisma.ApiKeyWhereInput = {
      ..._search,
      ..._enabled,
      ..._type,
    }

    const pagination = await this.apiKeyService.paginate(_where, _params, {
      bookType,
    })
    return pagination
  }

  @ApiRequestList({
    summary: API_KEY_DOC_OPERATION,
    queries: API_KEY_DOC_ADMIN_QUERY_LIST,
    // docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: ApiKeyResponseListDto,
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.API_KEY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.API_KEY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.CREATE],
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
    const { key, hash } = await this.apiKeyService.createHashApiKey()
    const apiKey = await this.apiKeyService.create({
      ...body,
      key,
      hash,
    })

    return {
      data: apiKey,
    }
  }

  @ApiRequestData({
    summary: API_KEY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.API_KEY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.API_KEY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
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
    const apiKey = await this.apiKeyService.resetHashApiKey(id)

    return {
      data: apiKey,
    }
  }

  @ApiRequestData({
    summary: API_KEY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.API_KEY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
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
    const apiKey = await this.apiKeyService.findOrFail(id)
    const renewApiKey = await this.apiKeyService.renew(apiKey, {
      startDate: body?.startDate || apiKey.startDate,
      untilDate: body.untilDate,
    })

    return {
      data: renewApiKey,
    }
  }

  @ApiRequestData({
    summary: API_KEY_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.API_KEY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.API_KEY,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.API_KEY,
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
    const apiKey = await this.apiKeyService.find(id)
    if (apiKey) {
      await this.apiKeyService.delete(apiKey, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
