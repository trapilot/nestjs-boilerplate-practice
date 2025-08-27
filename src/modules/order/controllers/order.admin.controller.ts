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
import { ORDER_DOC_ADMIN_QUERY_LIST, ORDER_DOC_OPERATION } from '../constants'
import {
  OrderRequestCreateDto,
  OrderRequestUpdateDto,
  OrderResponseDetailDto,
  OrderResponseListDto,
} from '../dtos'
import { OrderService } from '../services'

@ApiTags(ORDER_DOC_OPERATION)
@Controller({ path: '/orders' })
export class OrderAdminController {
  constructor(protected readonly orderService: OrderService) {}

  @ApiRequestPaging({
    summary: ORDER_DOC_OPERATION,
    queries: ORDER_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.ORDER,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: OrderResponseListDto,
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
    const _where: Prisma.OrderWhereInput = {
      ..._search,
    }
    const _include: Prisma.OrderInclude = {
      member: true,
    }

    const pagination = await this.orderService.paginate(_where, _params, {
      bookType,
      include: _include,
    })
    return pagination
  }

  @ApiRequestList({
    summary: ORDER_DOC_OPERATION,
    queries: ORDER_DOC_ADMIN_QUERY_LIST,
    docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: OrderResponseListDto,
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
    const _where: Prisma.OrderWhereInput = {
      ..._search,
    }
    const _select: Prisma.OrderSelect = {
      id: true,
    }

    const listing = await this.orderService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: ORDER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.ORDER,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: OrderResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const order = await this.orderService.findOrFail(id, {
      include: {
        member: true,
      },
    })
    return { data: order }
  }

  @ApiRequestData({
    summary: ORDER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.ORDER,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: OrderResponseDetailDto,
    },
  })
  @Post('/')
  async create(@RequestBody() body: OrderRequestCreateDto): Promise<IResponseData> {
    const order = await this.orderService.create(body)
    return { data: order }
  }

  @ApiRequestData({
    summary: ORDER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.ORDER,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: OrderResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: OrderRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const order = await this.orderService.update(id, body)

    return {
      data: order,
    }
  }

  @ApiRequestData({
    summary: ORDER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.ORDER,
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
    const order = await this.orderService.find(id)
    if (order) {
      await this.orderService.delete(order, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
