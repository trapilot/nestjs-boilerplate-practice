import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  ENUM_AUTH_ABILITY_ACTION,
  ENUM_AUTH_ABILITY_SUBJECT,
  ENUM_AUTH_SCOPE_TYPE,
} from 'lib/nest-auth'
import { HelperDateService, HelperRealtimeService, IDateRange } from 'lib/nest-core'
import { ApiRequestData, IResponseData } from 'lib/nest-web'
import { DASHBOARD_DOC_OPERATION } from '../constants'
import { DashboardSummaryResponseDto } from '../dtos'
import { DashboardService } from '../services'

@ApiTags(DASHBOARD_DOC_OPERATION)
@Controller({ path: '/dashboard' })
export class DashboardAdminController {
  constructor(
    protected readonly dashboardService: DashboardService,
    protected readonly helperDateService: HelperDateService,
    protected readonly helperRealtimeService: HelperRealtimeService,
  ) {}

  private getDate(): IDateRange {
    const dates = this.helperDateService.createRange()
    return dates
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
      docExpansion: true,
      cached: { key: DashboardSummaryResponseDto.name, ttl: 60_000 },
    },
  })
  @Get('/view-summary')
  async get(): Promise<IResponseData> {
    const dates = this.getDate()
    const dashboard = await this.dashboardService.getSummary(dates.startOfMonth, dates.endOfMonth)

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
      docExpansion: true,
    },
  })
  @Get('/refresh-summary')
  async refresh(): Promise<IResponseData> {
    const dates = this.getDate()
    const dashboard = await this.dashboardService.getSummary(dates.startOfMonth, dates.endOfMonth)

    await this.helperRealtimeService.cacheSet(DashboardSummaryResponseDto.name, dashboard)

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
      docExpansion: true,
    },
  })
  @Get('/view-data-list')
  async viewDataList(): Promise<IResponseData> {
    const dates = this.getDate()
    const dataList = await this.dashboardService.viewDataList(dates.startOfMonth, dates.endOfMonth)

    await this.helperRealtimeService.cacheSet(DashboardSummaryResponseDto.name, dataList)

    return {
      data: dataList,
    }
  }
}
