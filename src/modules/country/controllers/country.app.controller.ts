import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { ApiRequestList, IResponseList, RequestListDto, RequestQueryList } from 'lib/nest-web'
import { COUNTRY_DOC_OPERATION } from '../constants/country.doc.constant'
import { CountryResponseListDto } from '../dtos/country.response.detail.dto'
import { CountryService } from '../services/country.service'

@ApiTags(COUNTRY_DOC_OPERATION)
@Controller({ version: '1', path: '/countries' })
export class CountryAppController {
  constructor(protected readonly countryService: CountryService) {}

  @ApiRequestList({
    summary: COUNTRY_DOC_OPERATION,
    sortable: false,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    response: {
      dto: CountryResponseListDto,
    },
  })
  @Get('/list')
  async mapShorted(
    @RequestQueryList({
      defaultOrderBy: 'name:asc',
      availableOrderBy: ['name'],
    })
    { _search, _kwargs }: RequestListDto,
  ): Promise<IResponseList> {
    const _where: Prisma.CountryWhereInput = {
      ..._search,
    }
    const _select: Prisma.CountrySelect = {
      id: true,
      name: true,
    }

    return await this.countryService.getList({
      ..._kwargs,
      where: { ..._search },
      select: { id: true },
    })
  }
}
