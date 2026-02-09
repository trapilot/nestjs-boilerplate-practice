import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums/user.enum'
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
import { PAGE_DOC_ADMIN_QUERY_LIST, PAGE_DOC_OPERATION } from '../constants/page.doc.constant'
import { PageRequestCreateDto } from '../dtos/page.request.create.dto'
import { PageRequestUpdateDto } from '../dtos/page.request.update.dto'
import { PageResponseDetailDto, PageResponseListDto } from '../dtos/page.response.detail.dto'
import { PageService } from '../services/page.service'

@ApiTags(PAGE_DOC_OPERATION)
@Controller({ path: '/pages' })
export class PageAdminController {
  constructor(protected readonly pageService: PageService) {}

  @ApiRequestPaging({
    summary: PAGE_DOC_OPERATION,
    queries: PAGE_DOC_ADMIN_QUERY_LIST,
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
            subject: EnumAuthAbilitySubject.PAGE,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: PageResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'isActive:desc|sorting:desc|id:desc',
      availableOrderBy: ['id', 'sorting', 'isActive'],
    })
    { _search, _kwargs }: RequestListDto,
    @RequestBookType() bookType: EnumFileExtensionDocument,
    @RequestQueryFilterEqual('type') _type: RequestFilterDto,
  ): Promise<IResponsePaging> {
    const kwargs: Prisma.PageFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
        ..._type,
        isVisible: true,
      },
      include: {
        createdByUser: true,
        updatedByUser: true,
      },
    }

    return await this.pageService.getPage(kwargs, {
      document: bookType,
    })
  }

  @ApiRequestData({
    summary: PAGE_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.PAGE,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: PageResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const page = await this.pageService.findOrFail(id, {
      include: {
        createdByUser: true,
        updatedByUser: true,
      },
    })
    return { data: page }
  }

  @ApiRequestData({
    summary: PAGE_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.PAGE,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: PageResponseDetailDto,
    },
  })
  @Post('/')
  async create(
    @RequestBody() body: PageRequestCreateDto,
    @AuthJwtPayload('user.id') createdBy: number,
  ): Promise<IResponseData> {
    const created = await this.pageService.create({
      ...body,
      createdBy,
    })
    return { data: created }
  }

  @ApiRequestData({
    summary: PAGE_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.PAGE,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: PageResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: PageRequestUpdateDto,
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') updatedBy: number,
  ): Promise<IResponseData> {
    const updated = await this.pageService.update(id, {
      ...body,
      updatedBy,
    })

    return { data: updated }
  }

  @ApiRequestData({
    summary: PAGE_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.PAGE,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.DELETE],
          },
        ],
      },
    },
  })
  @Delete('/:id')
  async delete(@RequestParam('id') id: number): Promise<IResponseData> {
    await this.pageService.delete(id)
    return { data: { id } }
  }

  @ApiRequestData({
    summary: PAGE_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.PAGE,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: PageResponseDetailDto,
    },
  })
  @Put('/:id/active')
  async active(
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') updatedBy: number,
  ): Promise<IResponseData> {
    const updated = await this.pageService.change(id, {
      isActive: true,
      updatedBy,
    })

    return { data: updated }
  }

  @ApiRequestData({
    summary: PAGE_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.PAGE,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: PageResponseDetailDto,
    },
  })
  @Put('/:id/inactive')
  async inactive(
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') updatedBy: number,
  ): Promise<IResponseData> {
    const updated = await this.pageService.change(id, {
      isActive: false,
      updatedBy,
    })

    return { data: updated }
  }
}
