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
  INVOICE_DOC_ADMIN_QUERY_LIST,
  INVOICE_DOC_OPERATION,
} from '../constants/invoice.doc.constant'
import { InvoiceRequestCreateDto } from '../dtos/invoice.request.create.dto'
import { InvoiceRequestUpdateDto } from '../dtos/invoice.request.update.dto'
import {
  InvoiceResponseDetailDto,
  InvoiceResponseListDto,
} from '../dtos/invoice.response.detail.dto'
import { InvoiceService } from '../services/invoice.service'

@ApiTags(INVOICE_DOC_OPERATION)
@Controller({ path: '/invoices' })
export class InvoiceAdminController {
  constructor(protected readonly invoiceService: InvoiceService) {}

  @ApiRequestPaging({
    summary: INVOICE_DOC_OPERATION,
    queries: INVOICE_DOC_ADMIN_QUERY_LIST,
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
            subject: EnumAuthAbilitySubject.INVOICE,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: InvoiceResponseListDto,
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
    const _where: Prisma.InvoiceWhereInput = {
      ..._search,
    }
    const _include: Prisma.InvoiceInclude = {
      order: true,
      member: true,
    }

    const pagination = await this.invoiceService.paginate(_where, _params, {
      document: bookType,
      include: _include,
    })
    return pagination
  }

  @ApiRequestList({
    summary: INVOICE_DOC_OPERATION,
    queries: INVOICE_DOC_ADMIN_QUERY_LIST,
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
      dto: InvoiceResponseListDto,
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
    const _where: Prisma.InvoiceWhereInput = {
      ..._search,
    }
    const _select: Prisma.InvoiceSelect = {
      id: true,
    }

    const listing = await this.invoiceService.list(_where, _params, {
      select: _select,
    })
    return listing
  }

  @ApiRequestData({
    summary: INVOICE_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.INVOICE,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: InvoiceResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const invoice = await this.invoiceService.findOrFail(id, {
      include: {
        order: true,
        member: true,
      },
    })

    return {
      data: invoice,
    }
  }

  @ApiRequestData({
    summary: INVOICE_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.INVOICE,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: InvoiceResponseDetailDto,
    },
  })
  @Post('/')
  async create(@RequestBody() body: InvoiceRequestCreateDto): Promise<IResponseData> {
    const invoice = await this.invoiceService.create(body)

    return {
      data: invoice,
    }
  }

  @ApiRequestData({
    summary: INVOICE_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.INVOICE,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: InvoiceResponseDetailDto,
    },
  })
  @Put('/:id')
  async update(
    @RequestBody() body: InvoiceRequestUpdateDto,
    @RequestParam('id') id: number,
  ): Promise<IResponseData> {
    const invoice = await this.invoiceService.update(id, body)

    return {
      data: invoice,
    }
  }

  @ApiRequestData({
    summary: INVOICE_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.INVOICE,
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
    const invoice = await this.invoiceService.find(id)
    if (invoice) {
      await this.invoiceService.delete(invoice, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
