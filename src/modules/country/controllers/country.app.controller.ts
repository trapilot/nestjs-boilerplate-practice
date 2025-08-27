import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { ApiRequestList, IResponseList, RequestListDto, RequestQueryList } from 'lib/nest-web'
import { COUNTRY_DOC_OPERATION } from '../constants'
import { CountryResponseListDto } from '../dtos'
import { CountryService } from '../services'

@ApiTags(COUNTRY_DOC_OPERATION)
@Controller({ version: '1', path: '/countries' })
export class CountryAppController {
  constructor(protected readonly countryService: CountryService) {}

  @ApiRequestList({
    summary: COUNTRY_DOC_OPERATION,
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
    { _search, _params }: RequestListDto,
  ): Promise<IResponseList> {
    const _where: Prisma.CountryWhereInput = {
      ..._search,
    }
    const _select: Prisma.CountrySelect = {
      id: true,
      name: true,
    }

    const listing = await this.countryService.list(_where, _params, {
      select: _select,
    })
    return listing
  }
}
