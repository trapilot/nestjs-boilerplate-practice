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
import { POINT_SCHEMA_DOC_ADMIN_QUERY_LIST, POINT_SCHEMA_DOC_OPERATION } from '../constants/point-schema.doc.constant'
import { PointSchemaRequestCreateDto } from '../dtos/point-schema.request.create.dto'
import { PointSchemaRequestUpdateDto } from '../dtos/point-schema.request.update.dto'
import { PointSchemaResponseDetailDto, PointSchemaResponseListDto } from '../dtos/point-schema.response.detail.dto'
import { PointSchemaService } from '../services/point-schema.service'

@ApiTags(POINT_SCHEMA_DOC_OPERATION)
@Controller({ path: '/point-schemas' })
export class PointSchemaAdminController {
  constructor(protected readonly pointSchemaService: PointSchemaService) {}

  @ApiRequestPaging({
    summary: POINT_SCHEMA_DOC_OPERATION,
    queries: POINT_SCHEMA_DOC_ADMIN_QUERY_LIST,
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
            subject: EnumAuthAbilitySubject.POINT_SCHEMA,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: PointSchemaResponseListDto,
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
    const kwargs: Prisma.PointSchemaFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
      }
    }

    return await this.pointSchemaService.getPage(kwargs, {
      document: bookType,
    })
  }

  @ApiRequestList({
    summary: POINT_SCHEMA_DOC_OPERATION,
    queries: POINT_SCHEMA_DOC_ADMIN_QUERY_LIST,
    sortable: false,
    searchable: false,
    exportable: false,
    docExclude: true,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: PointSchemaResponseListDto,
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
    return await this.pointSchemaService.getList({
      ..._kwargs,
      where: { ..._search },
      select: { id: true }
    })
  }

  @ApiRequestData({
    summary: POINT_SCHEMA_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.POINT_SCHEMA,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: PointSchemaResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const pointSchema = await this.pointSchemaService.findOrFail(id)

    return {
      data: pointSchema,
    }
  }

  @ApiRequestData({
    summary: POINT_SCHEMA_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.POINT_SCHEMA,
            actions: [EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: PointSchemaResponseDetailDto,
    },
  })
  @Post('/')
  async create(@RequestBody() body: PointSchemaRequestCreateDto): Promise<IResponseData> {
    const pointSchema = await this.pointSchemaService.create(body)

    return {
      data: pointSchema,
    }
  }

  @ApiRequestData({
    summary: POINT_SCHEMA_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.POINT_SCHEMA,
            actions: [EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: PointSchemaResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: PointSchemaRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const pointSchema = await this.pointSchemaService.update(id, body)

    return {
      data: pointSchema,
    }
  }

  @ApiRequestData({
    summary: POINT_SCHEMA_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.POINT_SCHEMA,
            actions: [EnumAuthAbilityAction.DELETE],
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
    await this.pointSchemaService.delete(id, deletedBy)

    return {
      data: { status: true },
    }
  }
}
