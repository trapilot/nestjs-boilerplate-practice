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
import { <%= singular(uppercased(name)) %>_DOC_ADMIN_QUERY_LIST, <%= singular(uppercased(name)) %>_DOC_OPERATION } from '../constants/<%= singular(name) %>.doc.constant'
import { <%= singular(classify(name)) %>RequestCreateDto } from '../dtos/<%= singular(name) %>.request.create.dto'
import { <%= singular(classify(name)) %>RequestUpdateDto } from '../dtos/<%= singular(name) %>.request.update.dto'
import { <%= singular(classify(name)) %>ResponseDetailDto, <%= singular(classify(name)) %>ResponseListDto } from '../dtos/<%= singular(name) %>.response.detail.dto'
import { <%= singular(classify(name)) %>Service } from '../services/<%= singular(name) %>.service'

@ApiTags(<%= singular(uppercased(name)) %>_DOC_OPERATION)
@Controller({ path: '/<%= plural(name) %>' })
export class <%= singular(classify(name)) %>AdminController {
  constructor(protected readonly <%= singular(lowercased(name)) %>Service: <%= singular(classify(name)) %>Service) {}

  @ApiRequestPaging({
    summary: <%= singular(uppercased(name)) %>_DOC_OPERATION,
    queries: <%= singular(uppercased(name)) %>_DOC_ADMIN_QUERY_LIST,
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
            subject: EnumAuthAbilitySubject.<%= singular(uppercased(name)) %>,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: <%= singular(classify(name)) %>ResponseListDto,
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
    const kwargs: Prisma.<%= singular(classify(name)) %>FindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
      }
    }

    return await this.<%= singular(lowercased(name)) %>Service.getPage(kwargs, {
      document: bookType,
    })
  }

  @ApiRequestList({
    summary: <%= singular(uppercased(name)) %>_DOC_OPERATION,
    queries: <%= singular(uppercased(name)) %>_DOC_ADMIN_QUERY_LIST,
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
      dto: <%= singular(classify(name)) %>ResponseListDto,
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
    return await this.<%= singular(lowercased(name)) %>Service.getList({
      ..._kwargs,
      where: { ..._search },
      select: { id: true }
    })
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.<%= singular(uppercased(name)) %>,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: <%= singular(classify(name)) %>ResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const <%= singular(lowercased(name)) %> = await this.<%= singular(lowercased(name)) %>Service.findOrFail(id)

    return {
      data: <%= singular(lowercased(name)) %>,
    }
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.<%= singular(uppercased(name)) %>,
            actions: [EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: <%= singular(classify(name)) %>ResponseDetailDto,
    },
  })
  @Post('/')
  async create(@RequestBody() body: <%= singular(classify(name)) %>RequestCreateDto): Promise<IResponseData> {
    const <%= singular(lowercased(name)) %> = await this.<%= singular(lowercased(name)) %>Service.create(body)

    return {
      data: <%= singular(lowercased(name)) %>,
    }
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.<%= singular(uppercased(name)) %>,
            actions: [EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: <%= singular(classify(name)) %>ResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: <%= singular(classify(name)) %>RequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const <%= singular(lowercased(name)) %> = await this.<%= singular(lowercased(name)) %>Service.update(id, body)

    return {
      data: <%= singular(lowercased(name)) %>,
    }
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.<%= singular(uppercased(name)) %>,
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
    await this.<%= singular(lowercased(name)) %>Service.delete(id, deletedBy)

    return {
      data: { status: true },
    }
  }
}
