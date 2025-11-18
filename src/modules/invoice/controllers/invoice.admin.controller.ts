import { Controller, Delete, Get, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import {
  AuthJwtPayload,
  ENUM_AUTH_ABILITY_ACTION,
  ENUM_AUTH_ABILITY_SUBJECT,
  ENUM_AUTH_SCOPE_TYPE,
} from 'lib/nest-auth'
import { ENUM_FILE_TYPE_EXCEL } from 'lib/nest-core'
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
import { INVOICE_DOC_ADMIN_QUERY_LIST, INVOICE_DOC_OPERATION } from '../constants'
import {
  InvoiceRequestCreateDto,
  InvoiceRequestUpdateDto,
  InvoiceResponseDetailDto,
  InvoiceResponseListDto,
} from '../dtos'
import { InvoiceService } from '../services'

@ApiTags(INVOICE_DOC_OPERATION)
@Controller({ path: '/invoices' })
export class InvoiceAdminController {
  constructor(protected readonly invoiceService: InvoiceService) {}

  @ApiRequestPaging({
    summary: INVOICE_DOC_OPERATION,
    queries: INVOICE_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.INVOICE,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: InvoiceResponseListDto,
      docExpansion: true,
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
    const _where: Prisma.InvoiceWhereInput = {
      ..._search,
    }
    const _include: Prisma.InvoiceInclude = {
      order: true,
      member: true,
    }

    const pagination = await this.invoiceService.paginate(_where, _params, {
      bookType,
      include: _include,
    })
    return pagination
  }

  @ApiRequestList({
    summary: INVOICE_DOC_OPERATION,
    queries: INVOICE_DOC_ADMIN_QUERY_LIST,
    docExclude: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: InvoiceResponseListDto,
      docExpansion: true,
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.INVOICE,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: InvoiceResponseDetailDto,
      docExpansion: true,
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.INVOICE,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: InvoiceResponseDetailDto,
      docExpansion: true,
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.INVOICE,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: InvoiceResponseDetailDto,
      docExpansion: true,
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.INVOICE,
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
    const invoice = await this.invoiceService.find(id)
    if (invoice) {
      await this.invoiceService.delete(invoice, deletedBy)
    }

    return {
      data: { status: true },
    }
  }
}
