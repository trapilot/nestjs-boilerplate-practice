import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { AuthJwtPayload, EnumAuthScopeType } from 'lib/nest-auth'
import { EnumFileExtensionDocument } from 'lib/nest-core'
import {
  ApiRequestData,
  ApiRequestPaging,
  IResponseData,
  IResponsePaging,
  RequestBody,
  RequestBookType,
  RequestFilterDto,
  RequestListDto,
  RequestParam,
  RequestQueryFilterEqual,
  RequestQueryList,
} from 'lib/nest-web'
import { EnumAuthAbilitySubject, EnumAuthAbilityAction } from 'shared/enums'
import { FACT_DOC_ADMIN_QUERY_LIST, FACT_DOC_OPERATION } from '../constants'
import {
  FactRequestCreateDto,
  FactRequestUpdateDto,
  FactResponseDetailDto,
  FactResponseListDto,
} from '../dtos'
import { FactService } from '../services'

@ApiTags(FACT_DOC_OPERATION)
@Controller({ path: '/facts' })
export class FactAdminController {
  constructor(protected readonly factService: FactService) {}

  @ApiRequestPaging({
    summary: FACT_DOC_OPERATION,
    queries: FACT_DOC_ADMIN_QUERY_LIST,
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
            subject: EnumAuthAbilitySubject.FACT,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: FactResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'isActive:desc|sorting:desc|id:desc',
      availableOrderBy: ['id', 'sorting', 'isActive'],
    })
    { _search, _params }: RequestListDto,
    @RequestBookType() bookType: EnumFileExtensionDocument,
    @RequestQueryFilterEqual('type') _type: RequestFilterDto,
  ): Promise<IResponsePaging> {
    const _where: Prisma.FactWhereInput = {
      ..._search,
      ..._type,
      isVisible: true,
    }
    const _include: Prisma.FactInclude = {
      createdByUser: true,
      updatedByUser: true,
    }

    const pagination = await this.factService.paginate(_where, _params, {
      document: bookType,
      include: _include,
    })
    return pagination
  }

  @ApiRequestData({
    summary: FACT_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.FACT,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: FactResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const fact = await this.factService.findOrFail(id, {
      include: {
        createdByUser: true,
        updatedByUser: true,
      },
    })
    return { data: fact }
  }

  @ApiRequestData({
    summary: FACT_DOC_OPERATION,
    deprecated: true,
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
            subject: EnumAuthAbilitySubject.FACT,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: FactResponseDetailDto,
    },
  })
  @Post('/')
  async create(
    @RequestBody() body: FactRequestCreateDto,
    @AuthJwtPayload('user.id') createdBy: number,
  ): Promise<IResponseData> {
    const created = await this.factService.create({
      ...body,
      createdBy,
    })
    return { data: created }
  }

  @ApiRequestData({
    summary: FACT_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.FACT,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: FactResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: FactRequestUpdateDto,
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') updatedBy: number,
  ): Promise<IResponseData> {
    const updated = await this.factService.update(id, {
      ...body,
      updatedBy,
    })

    return { data: updated }
  }

  @ApiRequestData({
    summary: FACT_DOC_OPERATION,
    deprecated: true,
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
            subject: EnumAuthAbilitySubject.FACT,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.DELETE],
          },
        ],
      },
    },
  })
  @Delete('/:id')
  async delete(@RequestParam('id') id: number): Promise<IResponseData> {
    await this.factService.delete(id)
    return { data: { id } }
  }

  @ApiRequestData({
    summary: FACT_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.FACT,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: FactResponseDetailDto,
    },
  })
  @Put('/:id/active')
  async active(
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') updatedBy: number,
  ): Promise<IResponseData> {
    const updated = await this.factService.change(id, {
      isActive: true,
      updatedBy,
    })

    return { data: updated }
  }

  @ApiRequestData({
    summary: FACT_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.FACT,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: FactResponseDetailDto,
    },
  })
  @Put('/:id/inactive')
  async inactive(
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') updatedBy: number,
  ): Promise<IResponseData> {
    const updated = await this.factService.change(id, {
      isActive: false,
      updatedBy,
    })

    return { data: updated }
  }
}
