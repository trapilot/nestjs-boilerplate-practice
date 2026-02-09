import { Controller, Get } from '@nestjs/common'
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
import {
  INVOICE_DOC_APP_QUERY_LIST,
  INVOICE_DOC_OPERATION,
} from '../constants/invoice.doc.constant'
import {
  InvoiceResponseDetailDto,
  InvoiceResponseListDto,
} from '../dtos/invoice.response.detail.dto'
import { InvoiceService } from '../services/invoice.service'

@ApiTags(INVOICE_DOC_OPERATION)
@Controller({ version: '1', path: '/invoices' })
export class InvoiceAppController {
  constructor(protected readonly invoiceService: InvoiceService) {}

  @ApiRequestPaging({
    summary: INVOICE_DOC_OPERATION,
    queries: INVOICE_DOC_APP_QUERY_LIST,
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
    { _search, _kwargs }: RequestListDto,
    @AuthJwtPayload(['user.id', { parseAs: 'id' }]) memberId: number,
  ): Promise<IResponsePaging> {
    const kwargs: Prisma.InvoiceFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
        memberId,
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    }

    return await this.invoiceService.getPage(kwargs)
  }

  @ApiRequestData({
    summary: INVOICE_DOC_OPERATION,
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
      dto: InvoiceResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const invoice = await this.invoiceService.findOrFail(id, {
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    })

    return {
      data: invoice,
    }
  }
}
