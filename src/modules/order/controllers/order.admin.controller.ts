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
import { ORDER_DOC_ADMIN_QUERY_LIST, ORDER_DOC_OPERATION } from '../constants/order.doc.constant'
import { OrderRequestCreateDto } from '../dtos/order.request.create.dto'
import { OrderRequestUpdateDto } from '../dtos/order.request.update.dto'
import { OrderResponseDetailDto, OrderResponseListDto } from '../dtos/order.response.detail.dto'
import { OrderService } from '../services/order.service'

@ApiTags(ORDER_DOC_OPERATION)
@Controller({ path: '/orders' })
export class OrderAdminController {
  constructor(protected readonly orderService: OrderService) {}

  @ApiRequestPaging({
    summary: ORDER_DOC_OPERATION,
    queries: ORDER_DOC_ADMIN_QUERY_LIST,
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
            subject: EnumAuthAbilitySubject.ORDER,
            actions: [EnumAuthAbilityAction.READ],
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
    { _search, _kwargs }: RequestListDto,
    @RequestBookType() bookType: EnumFileExtensionDocument,
  ): Promise<IResponsePaging> {
    const kwargs: Prisma.OrderFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
      },
      include: {
        member: true,
      },
    }

    return await this.orderService.getPage(kwargs, {
      document: bookType,
    })
  }

  @ApiRequestList({
    summary: ORDER_DOC_OPERATION,
    queries: ORDER_DOC_ADMIN_QUERY_LIST,
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
      dto: OrderResponseListDto,
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
    return await this.orderService.getList({
      ..._kwargs,
      where: { ..._search },
      select: { id: true },
    })
  }

  @ApiRequestData({
    summary: ORDER_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.ORDER,
            actions: [EnumAuthAbilityAction.READ],
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
            subject: EnumAuthAbilitySubject.ORDER,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
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
            subject: EnumAuthAbilitySubject.ORDER,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
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
            subject: EnumAuthAbilitySubject.ORDER,
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
    await this.orderService.delete(id, deletedBy)

    return {
      data: { status: true },
    }
  }
}
