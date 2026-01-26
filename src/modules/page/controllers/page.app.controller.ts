import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { EnumAuthScopeType } from 'lib/nest-auth'
import { ApiRequestData, IResponseData } from 'lib/nest-web'
import { PAGE_DOC_OPERATION } from '../constants'
import { PageResponseDetailDto } from '../dtos'
import { EnumPageType } from '../enums'
import { PageService } from '../services'

@ApiTags(PAGE_DOC_OPERATION)
@Controller({ version: '1', path: '/pages' })
export class PageAppController {
  constructor(protected readonly pageService: PageService) {}

  @ApiRequestData({
    summary: PAGE_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.MEMBER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: PageResponseDetailDto,
    },
  })
  @Get('/terms-and-conditions')
  async getTAC(): Promise<IResponseData> {
    const page = await this.pageService.findFirst({
      where: {
        type: EnumPageType.TERM_AND_CONDITION,
        isActive: true,
      },
      orderBy: [{ sorting: 'desc' }, { id: 'desc' }],
    })
    return { data: page }
  }

  @ApiRequestData({
    summary: PAGE_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.MEMBER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: PageResponseDetailDto,
    },
  })
  @Get('/about-us')
  async getAboutUs(): Promise<IResponseData> {
    const page = await this.pageService.findFirst({
      where: {
        type: EnumPageType.ABOUT_US,
        isActive: true,
      },
      orderBy: [{ sorting: 'desc' }, { id: 'desc' }],
    })
    return { data: page }
  }

  @ApiRequestData({
    summary: PAGE_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.MEMBER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: PageResponseDetailDto,
    },
  })
  @Get('/privacy-policy')
  async getPrivatePolicy(): Promise<IResponseData> {
    const page = await this.pageService.findFirst({
      where: {
        type: EnumPageType.PRIVACY,
        isActive: true,
      },
      orderBy: [{ sorting: 'desc' }, { id: 'desc' }],
    })
    return { data: page }
  }
}
