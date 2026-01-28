import { Controller, Get, Patch } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { AuthJwtPayload, EnumAuthScopeType } from 'lib/nest-auth'
import {
  ApiRequestData,
  ApiRequestPaging,
  IResponseData,
  IResponsePaging,
  RequestListDto,
  RequestParam,
  RequestQueryList,
} from 'lib/nest-web'
import { MEMBER_REDEMPTION_DOC_APP_QUERY_LIST, MEMBER_REDEMPTION_DOC_OPERATION } from '../constants'
import { MemberRedemptionResponseDetailDto, MemberRedemptionResponseListDto } from '../dtos'
import { MemberRedemptionService } from '../services'

@ApiTags(MEMBER_REDEMPTION_DOC_OPERATION)
@Controller({ version: '1', path: '/member-redemptions' })
export class MemberRedemptionAppController {
  constructor(protected readonly productHistoryService: MemberRedemptionService) {}

  @ApiRequestPaging({
    summary: MEMBER_REDEMPTION_DOC_OPERATION,
    queries: MEMBER_REDEMPTION_DOC_APP_QUERY_LIST,
    sortable: true,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.MEMBER,
      user: {
        synchronize: false,
        require: true,
      },
    },
    response: {
      dto: MemberRedemptionResponseListDto,
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
    @AuthJwtPayload(['user.id', { parseAs: 'id' }]) memberId: number,
  ): Promise<IResponsePaging> {
    const _where: Prisma.MemberRedemptionWhereInput = {
      ..._search,
      memberId,
    }
    const _include: Prisma.MemberRedemptionInclude = {
      product: true,
      order: true,
    }

    const pagination = await this.productHistoryService.paginate(_where, _params, {
      include: _include,
    })
    return pagination
  }

  @ApiRequestData({
    summary: MEMBER_REDEMPTION_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.MEMBER,
      user: {
        synchronize: false,
        require: true,
      },
    },
    response: {
      dto: MemberRedemptionResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const productHistory = await this.productHistoryService.findOrFail(id, {
      include: {
        product: true,
        order: true,
      },
    })

    return {
      data: productHistory,
    }
  }
  @ApiRequestData({
    summary: MEMBER_REDEMPTION_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.MEMBER,
      user: {
        synchronize: false,
        require: true,
      },
    },
    response: {
      dto: MemberRedemptionResponseDetailDto,
    },
  })
  @Patch('/:id/reserve')
  async reserve(
    @RequestParam('id') id: number,
    @AuthJwtPayload(['user.id', { parseAs: 'id' }]) memberId: number,
  ): Promise<IResponseData> {
    const productHistory = await this.productHistoryService.matchOrFail({
      id,
      memberId,
    })

    const reserved = await this.productHistoryService.reserve(productHistory)

    return {
      data: reserved,
    }
  }
}
