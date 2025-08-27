import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Controller, Get, Inject } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Cache } from 'cache-manager'
import { HelperDateService } from 'lib/nest-core'
import {
  ENUM_AUTH_ABILITY_ACTION,
  ENUM_AUTH_SCOPE_TYPE,
  ENUM_AUTH_ABILITY_SUBJECT,
} from 'lib/nest-auth'
import { ApiRequestData, IResponseData } from 'lib/nest-web'
import { DASHBOARD_DOC_OPERATION } from '../constants'
import { DashboardSummaryResponseDto } from '../dtos'
import { DashboardService } from '../services'

@ApiTags(DASHBOARD_DOC_OPERATION)
@Controller({ path: '/dashboard' })
export class DashboardAdminController {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cache: Cache,
    protected readonly dashboardService: DashboardService,
    protected readonly helperDateService: HelperDateService,
  ) {}

  @ApiRequestData({
    summary: DASHBOARD_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.DASHBOARD,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: DashboardSummaryResponseDto,
      cached: { key: DashboardSummaryResponseDto.name, ttl: 60_000 },
    },
  })
  @Get('/view-summary')
  async get(): Promise<IResponseData> {
    const date = this.helperDateService.create()
    const dashboard = await this.dashboardService.getSummary(date)

    return {
      data: dashboard,
    }
  }

  @ApiRequestData({
    summary: DASHBOARD_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.DASHBOARD,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: DashboardSummaryResponseDto,
    },
  })
  @Get('/refresh-summary')
  async refresh(): Promise<IResponseData> {
    const date = this.helperDateService.create()
    const dashboard = await this.dashboardService.getSummary(date)

    await this.cache.set(DashboardSummaryResponseDto.name, dashboard)

    return {
      data: dashboard,
    }
  }

  @ApiRequestData({
    summary: DASHBOARD_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.DASHBOARD,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: DashboardSummaryResponseDto,
    },
  })
  @Get('/view-data-list')
  async viewDataList(): Promise<IResponseData> {
    const date = this.helperDateService.create()
    const dashboard = await this.dashboardService.getSummary(date)

    await this.cache.set(DashboardSummaryResponseDto.name, dashboard)

    return {
      data: dashboard,
    }
  }
}
