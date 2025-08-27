import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { AuthJwtPayload, ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import {
  ApiRequestData,
  ApiRequestPaging,
  IResponseData,
  IResponsePaging,
  RequestListDto,
  RequestParam,
  RequestQueryList,
} from 'lib/nest-web'
import { INVOICE_DOC_APP_QUERY_LIST, INVOICE_DOC_OPERATION } from '../constants'
import { InvoiceResponseDetailDto, InvoiceResponseListDto } from '../dtos'
import { InvoiceService } from '../services'

@ApiTags(INVOICE_DOC_OPERATION)
@Controller({ version: '1', path: '/invoices' })
export class InvoiceAppController {
  constructor(protected readonly invoiceService: InvoiceService) {}

  @ApiRequestPaging({
    summary: INVOICE_DOC_OPERATION,
    queries: INVOICE_DOC_APP_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
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
    { _search, _params }: RequestListDto,
    @AuthJwtPayload(['user.id', { parseAs: 'id' }]) memberId: number,
  ): Promise<IResponsePaging> {
    const _where: Prisma.InvoiceWhereInput = {
      ..._search,
      memberId,
    }
    const _include: Prisma.InvoiceInclude = {
      order: {
        include: {
          items: true,
        },
      },
    }

    const pagination = await this.invoiceService.paginate(_where, _params, {
      include: _include,
    })
    return pagination
  }

  @ApiRequestData({
    summary: INVOICE_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
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
