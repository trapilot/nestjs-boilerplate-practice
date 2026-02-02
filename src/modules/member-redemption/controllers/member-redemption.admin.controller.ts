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
import {
  MEMBER_REDEMPTION_DOC_ADMIN_QUERY_LIST,
  MEMBER_REDEMPTION_DOC_OPERATION,
} from '../constants/member-redemption.doc.constant'
import { MemberRedemptionRequestCreateDto } from '../dtos/member-redemption.request.create.dto'
import { MemberRedemptionRequestUpdateDto } from '../dtos/member-redemption.request.update.dto'
import {
  MemberRedemptionResponseDetailDto,
  MemberRedemptionResponseListDto,
} from '../dtos/member-redemption.response.detail.dto'
import { MemberRedemptionService } from '../services/member-redemption.service'

@ApiTags(MEMBER_REDEMPTION_DOC_OPERATION)
@Controller({ path: '/member-redemptions' })
export class MemberRedemptionAdminController {
  constructor(protected readonly productHistoryService: MemberRedemptionService) {}

  @ApiRequestPaging({
    summary: MEMBER_REDEMPTION_DOC_OPERATION,
    queries: MEMBER_REDEMPTION_DOC_ADMIN_QUERY_LIST,
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
            subject: EnumAuthAbilitySubject.MEMBER_REDEMPTION,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
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
    @RequestBookType() bookType: EnumFileExtensionDocument,
  ): Promise<IResponsePaging> {
    const _where: Prisma.MemberRedemptionWhereInput = {
      ..._search,
    }
    const _include: Prisma.MemberRedemptionInclude = {
      member: true,
      product: true,
      order: true,
    }

    const pagination = await this.productHistoryService.paginate(_where, _params, {
      document: bookType,
      include: _include,
    })
    return pagination
  }

  @ApiRequestList({
    summary: MEMBER_REDEMPTION_DOC_OPERATION,
    queries: MEMBER_REDEMPTION_DOC_ADMIN_QUERY_LIST,
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
      dto: MemberRedemptionResponseListDto,
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
    const _where: Prisma.MemberRedemptionWhereInput = {
      ..._search,
    }
    const _select: Prisma.MemberRedemptionSelect = {
      id: true,
    }

    const listing = await this.productHistoryService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: MEMBER_REDEMPTION_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.MEMBER_REDEMPTION,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
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
        member: true,
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
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.MEMBER_REDEMPTION,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: MemberRedemptionResponseDetailDto,
    },
  })
  @Post('/')
  async create(@RequestBody() body: MemberRedemptionRequestCreateDto): Promise<IResponseData> {
    const productHistory = await this.productHistoryService.create(body)

    return {
      data: productHistory,
    }
  }

  @ApiRequestData({
    summary: MEMBER_REDEMPTION_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.MEMBER_REDEMPTION,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: MemberRedemptionResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: MemberRedemptionRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const productHistory = await this.productHistoryService.update(id, body)

    return {
      data: productHistory,
    }
  }

  @ApiRequestData({
    summary: MEMBER_REDEMPTION_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.MEMBER_REDEMPTION,
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
    const productHistory = await this.productHistoryService.find(id)
    if (productHistory) {
      await this.productHistoryService.delete(productHistory, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
