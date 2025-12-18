import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { ENUM_APP_ABILITY_ACTION, ENUM_APP_ABILITY_SUBJECT } from 'app/enums'
import { AuthJwtPayload, ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import { ENUM_FILE_TYPE_EXCEL } from 'lib/nest-core'
import { PrismaUtil } from 'lib/nest-prisma'
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
import { TIER_DOC_ADMIN_QUERY_LIST, TIER_DOC_OPERATION } from '../constants'
import {
  TierRequestCreateDto,
  TierRequestUpdateDto,
  TierResponseDetailDto,
  TierResponseListDto,
} from '../dtos'
import { TierService } from '../services'

@ApiTags(TIER_DOC_OPERATION)
@Controller({ path: '/tiers' })
export class TierAdminController {
  constructor(protected readonly tierService: TierService) {}

  @ApiRequestPaging({
    summary: TIER_DOC_OPERATION,
    queries: TIER_DOC_ADMIN_QUERY_LIST,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.TIER,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: TierResponseListDto,
      docExpansion: true,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'level:asc',
      availableOrderBy: ['level'],
    })
    { _search, _params }: RequestListDto,
    @RequestBookType() bookType: ENUM_FILE_TYPE_EXCEL,
  ): Promise<IResponsePaging> {
    const _where: Prisma.TierWhereInput = {
      ..._search,
    }

    const pagination = await this.tierService.paginate(_where, _params, {
      bookType,
    })
    return pagination
  }

  @ApiRequestList({
    summary: TIER_DOC_OPERATION,
    queries: TIER_DOC_ADMIN_QUERY_LIST,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: TierResponseListDto,
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
    const _where: Prisma.TierWhereInput = {
      ..._search,
    }
    const _select: Prisma.TierSelect = {
      id: true,
      code: true,
      name: true,
    }

    const listing = await this.tierService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: TIER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.TIER,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: TierResponseDetailDto,
      docExpansion: true,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const tier = await this.tierService.findOrFail(id, {
      include: {
        languages: true,
        charts: true,
      },
    })

    return {
      data: tier,
    }
  }

  @ApiRequestData({
    summary: TIER_DOC_OPERATION,
    docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.TIER,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: TierResponseDetailDto,
      docExpansion: true,
    },
  })
  @Post('/')
  async create(@RequestBody() body: TierRequestCreateDto): Promise<IResponseData> {
    const { description, ...data } = body
    const jsonLanguage = { description }

    const tier = await this.tierService.create({
      ...data,
      languages: PrismaUtil.buildLanguages(jsonLanguage),
    })

    return {
      data: tier,
    }
  }

  @ApiRequestData({
    summary: TIER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.TIER,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: TierResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: TierRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const { description, ...data } = body
    const jsonLanguage = { description }

    const tier = await this.tierService.update(id, {
      ...data,
      languages: PrismaUtil.buildLanguages<Prisma.TierLanguageWhereInput>(jsonLanguage, {
        whereField: {
          tierId: id,
        },
      }),
    })

    return {
      data: tier,
    }
  }

  @ApiRequestData({
    summary: TIER_DOC_OPERATION,
    docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.TIER,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.DELETE],
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
    const tier = await this.tierService.find(id)
    if (tier) {
      await this.tierService.delete(tier, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
