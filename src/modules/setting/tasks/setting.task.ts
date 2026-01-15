import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { APP_TIMEZONE, EnumScopeType, ScopeAsync } from 'lib/nest-core'
import { SettingService } from '../services'

@Injectable()
export class SettingTask {
  constructor(private readonly settingService: SettingService) {}

  @Cron(CronExpression.EVERY_HOUR, { timeZone: APP_TIMEZONE })
  @ScopeAsync(EnumScopeType.CRON, { context: 'cron.setting_clean_up_cache' })
  async resetCacheSetting(): Promise<void> {
    await this.settingService.clearCache()
  }
}
