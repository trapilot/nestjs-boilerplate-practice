import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import { ApiRequestData, IResponseData } from 'lib/nest-web'
import { FACT_DOC_OPERATION } from '../constants'
import { FactResponseDetailDto } from '../dtos'
import { ENUM_FACT_TYPE } from '../enums'
import { FactService } from '../services'

@ApiTags(FACT_DOC_OPERATION)
@Controller({ version: '1', path: '/facts' })
export class FactAppController {
  constructor(protected readonly factService: FactService) {}

  @ApiRequestData({
    summary: FACT_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: FactResponseDetailDto,
    },
  })
  @Get('/terms-and-conditions')
  async getTAC(): Promise<IResponseData> {
    const fact = await this.factService.findFirst({
      where: {
        type: ENUM_FACT_TYPE.TERM_AND_CONDITION,
        isActive: true,
      },
      orderBy: [{ sorting: 'desc' }, { id: 'desc' }],
    })
    return { data: fact }
  }

  @ApiRequestData({
    summary: FACT_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: FactResponseDetailDto,
    },
  })
  @Get('/about-us')
  async getAboutUs(): Promise<IResponseData> {
    const fact = await this.factService.findFirst({
      where: {
        type: ENUM_FACT_TYPE.ABOUT_US,
        isActive: true,
      },
      orderBy: [{ sorting: 'desc' }, { id: 'desc' }],
    })
    return { data: fact }
  }

  @ApiRequestData({
    summary: FACT_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: FactResponseDetailDto,
    },
  })
  @Get('/privacy-policy')
  async getPrivatePolicy(): Promise<IResponseData> {
    const fact = await this.factService.findFirst({
      where: {
        type: ENUM_FACT_TYPE.PRIVACY,
        isActive: true,
      },
      orderBy: [{ sorting: 'desc' }, { id: 'desc' }],
    })
    return { data: fact }
  }
}
