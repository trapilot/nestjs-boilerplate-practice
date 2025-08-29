import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
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
  RequestListDto,
  RequestParam,
  RequestQueryList,
} from 'lib/nest-web'
import { <%= singular(uppercased(name)) %>_DOC_ADMIN_QUERY_LIST, <%= singular(uppercased(name)) %>_DOC_OPERATION } from '../constants'
import {
  <%= singular(classify(name)) %>RequestCreateDto,
  <%= singular(classify(name)) %>RequestUpdateDto,
  <%= singular(classify(name)) %>ResponseDetailDto,
  <%= singular(classify(name)) %>ResponseListDto,
} from '../dtos'
import { <%= singular(classify(name)) %>Service } from '../services'

@ApiTags(<%= singular(uppercased(name)) %>_DOC_OPERATION)
@Controller({ path: '/<%= plural(name) %>' })
export class <%= singular(classify(name)) %>AdminController {
  constructor(protected readonly <%= singular(lowercased(name)) %>Service: <%= singular(classify(name)) %>Service) {}

  @ApiRequestPaging({
    summary: <%= singular(uppercased(name)) %>_DOC_OPERATION,
    queries: <%= singular(uppercased(name)) %>_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.<%= singular(uppercased(name)) %>,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
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
    { _search, _params }: RequestListDto,
    @RequestBookType() bookType: ENUM_FILE_TYPE_EXCEL,
  ): Promise<IResponsePaging> {
    const _where: Prisma.<%= singular(classify(name)) %>WhereInput = {
      ..._search,
    }

    const pagination = await this.<%= singular(lowercased(name)) %>Service.paginate(_where, _params, {
      bookType,
    })
    return pagination
  }

  @ApiRequestList({
    summary: <%= singular(uppercased(name)) %>_DOC_OPERATION,
    queries: <%= singular(uppercased(name)) %>_DOC_ADMIN_QUERY_LIST,
    docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
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
    { _search, _params }: RequestListDto,
  ): Promise<IResponseList> {
    const _where: Prisma.<%= singular(classify(name)) %>WhereInput = {
      ..._search,
    }
    const _select: Prisma.<%= singular(classify(name)) %>Select = {
      id: true,
    }

    const listing = await this.<%= singular(lowercased(name)) %>Service.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.<%= singular(uppercased(name)) %>,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.<%= singular(uppercased(name)) %>,
            actions: [ENUM_AUTH_ABILITY_ACTION.CREATE],
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.<%= singular(uppercased(name)) %>,
            actions: [ENUM_AUTH_ABILITY_ACTION.UPDATE],
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.<%= singular(uppercased(name)) %>,
            actions: [ENUM_AUTH_ABILITY_ACTION.DELETE],
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
    const <%= singular(lowercased(name)) %> = await this.<%= singular(lowercased(name)) %>Service.find(id)
    if (<%= singular(lowercased(name)) %>) {
      await this.<%= singular(lowercased(name)) %>Service.delete(<%= singular(lowercased(name)) %>, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
