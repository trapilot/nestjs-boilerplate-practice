import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums/user.enum'
import { EnumAuthScopeType } from 'lib/nest-auth'
import { HelperService } from 'lib/nest-core'
import { ApiRequestData, IResponseData } from 'lib/nest-web'
import { DASHBOARD_DOC_OPERATION } from '../constants/dashboard.doc.constant'
import { DashboardDataResponseDto } from '../dtos/dashboard.view-data.response.dto'
import { DashboardSummaryResponseDto } from '../dtos/dashboard.view-summary.response.dto'
import { IDashboardDateRange } from '../interfaces/dashboard.interface'
import { DashboardService } from '../services/dashboard.service'

@ApiTags(DASHBOARD_DOC_OPERATION)
@Controller({ path: '/dashboard' })
export class DashboardAdminController {
  constructor(
    protected readonly dashboardService: DashboardService,
    protected readonly helperService: HelperService,
  ) {}

  private getDates(): IDashboardDateRange {
    const dataInYears = 5
    const nowDate = this.helperService.dateNow()
    const dateRange = this.helperService.dateRange(nowDate)

    return {
      untilDate: dateRange.endOfYear,
      sinceDate: this.helperService.dateBackward(dateRange.startOfYear, {
        years: dataInYears - 1,
      }),
    }
  }

  @ApiRequestData({
    summary: DASHBOARD_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.DASHBOARD,
            actions: [EnumAuthAbilityAction.READ],
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
    const dashboard = await this.dashboardService.getSummary(dates.sinceDate, dates.untilDate)

    return {
      data: dashboard,
    }
  }

  @ApiRequestData({
    summary: DASHBOARD_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.DASHBOARD,
            actions: [EnumAuthAbilityAction.READ],
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
    const dashboard = await this.dashboardService.getSummary(dates.sinceDate, dates.untilDate)

    return {
      data: dashboard,
    }
  }

  @ApiRequestData({
    summary: DASHBOARD_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.DASHBOARD,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: DashboardDataResponseDto,
      cached: { key: DashboardDataResponseDto.name, ttl: 60_000 },
    },
  })
  @Get('/view-data-list')
  async viewDataList(): Promise<IResponseData> {
    const dates = this.getDates()
    const dataList = await this.dashboardService.viewDataList(dates.sinceDate, dates.untilDate)

    return {
      data: dataList,
    }
  }
}
