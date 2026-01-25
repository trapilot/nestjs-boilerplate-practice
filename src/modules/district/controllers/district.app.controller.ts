import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { ApiRequestList, IResponseList, RequestListDto, RequestQueryList } from 'lib/nest-web'
import { DISTRICT_DOC_OPERATION } from '../constants'
import { DistrictResponseListDto } from '../dtos'
import { DistrictService } from '../services'

@ApiTags(DISTRICT_DOC_OPERATION)
@Controller({ version: '1', path: '/districts' })
export class DistrictAppController {
  constructor(protected readonly districtService: DistrictService) {}

  @ApiRequestList({
    summary: DISTRICT_DOC_OPERATION,
    sortable: false,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    response: {
      dto: DistrictResponseListDto,
    },
  })
  @Get('/list')
  async list(
    @RequestQueryList({
      defaultOrderBy: 'name:asc',
      availableOrderBy: ['name'],
    })
    { _search, _params }: RequestListDto,
  ): Promise<IResponseList> {
    const _where: Prisma.DistrictWhereInput = {
      ..._search,
    }
    const _select: Prisma.DistrictSelect = {
      id: true,
      name: true,
    }

    const listing = await this.districtService.list(_where, _params, {
      select: _select,
    })
    return listing
  }
}
