import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import { CacheService, HelperService, IDateRange } from 'lib/nest-core'
import { ApiRequestData, IResponseData } from 'lib/nest-web'
import { ENUM_APP_ABILITY_ACTION, ENUM_APP_ABILITY_SUBJECT } from 'shared/enums'
import { DASHBOARD_DOC_OPERATION } from '../constants'
import { DashboardSummaryResponseDto } from '../dtos'
import { DashboardService } from '../services'

@ApiTags(DASHBOARD_DOC_OPERATION)
@Controller({ path: '/dashboard' })
export class DashboardAdminController {
  constructor(
    protected readonly dashboardService: DashboardService,
    protected readonly cacheService: CacheService,
    protected readonly helperService: HelperService,
  ) {}

  private getDates(): IDateRange {
    const dateNow = this.helperService.dateCreate()
    const dateRange = this.helperService.dateRange(dateNow)
    return dateRange
  }

  @ApiRequestData({
    summary: DASHBOARD_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.DASHBOARD,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
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
    const dates = this.getDates()
    const dashboard = await this.dashboardService.getSummary(dates.startOfYear, dates.endOfYear)

    return {
      data: dashboard,
    }
  }

  @ApiRequestData({
    summary: DASHBOARD_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.DASHBOARD,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
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
    const dates = this.getDates()
    const dashboard = await this.dashboardService.getSummary(dates.startOfYear, dates.endOfYear)

    await this.cacheService.set(DashboardSummaryResponseDto.name, dashboard)

    return {
      data: dashboard,
    }
  }

  @ApiRequestData({
    summary: DASHBOARD_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.DASHBOARD,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
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
    const dates = this.getDates()
    const dataList = await this.dashboardService.viewDataList(dates.startOfYear, dates.endOfYear)

    await this.cacheService.set(DashboardSummaryResponseDto.name, dataList)

    return {
      data: dataList,
    }
  }
}
