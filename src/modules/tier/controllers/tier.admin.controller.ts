import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums/user.enum'
import { AuthJwtPayload, EnumAuthScopeType } from 'lib/nest-auth'
import { EnumFileExtensionDocument } from 'lib/nest-core'
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
import { TIER_DOC_ADMIN_QUERY_LIST, TIER_DOC_OPERATION } from '../constants/tier.doc.constant'
import { TierRequestCreateDto } from '../dtos/tier.request.create.dto'
import { TierRequestUpdateDto } from '../dtos/tier.request.update.dto'
import { TierResponseDetailDto, TierResponseListDto } from '../dtos/tier.response.detail.dto'
import { TierService } from '../services/tier.service'

@ApiTags(TIER_DOC_OPERATION)
@Controller({ path: '/tiers' })
export class TierAdminController {
  constructor(protected readonly tierService: TierService) {}

  @ApiRequestPaging({
    summary: TIER_DOC_OPERATION,
    queries: TIER_DOC_ADMIN_QUERY_LIST,
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
            subject: EnumAuthAbilitySubject.TIER,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: TierResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'level:asc',
      availableOrderBy: ['level'],
    })
    { _search, _kwargs }: RequestListDto,
    @RequestBookType() bookType: EnumFileExtensionDocument,
  ): Promise<IResponsePaging> {
    const kwargs: Prisma.TierFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
      },
    }

    return await this.tierService.getPage(kwargs, {
      document: bookType,
    })
  }

  @ApiRequestList({
    summary: TIER_DOC_OPERATION,
    queries: TIER_DOC_ADMIN_QUERY_LIST,
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
      dto: TierResponseListDto,
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
    return await this.tierService.getList({
      ..._kwargs,
      where: { ..._search },
      select: { id: true },
    })
  }

  @ApiRequestData({
    summary: TIER_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.TIER,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: TierResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const tier = await this.tierService.findOrFail(id, {
      include: {
        languages: true,
      },
    })

    return {
      data: tier,
    }
  }

  @ApiRequestData({
    summary: TIER_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.TIER,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: TierResponseDetailDto,
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
            subject: EnumAuthAbilitySubject.TIER,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: TierResponseDetailDto,
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
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.TIER,
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
    await this.tierService.delete(id, deletedBy)

    return {
      data: { status: true },
    }
  }
}
