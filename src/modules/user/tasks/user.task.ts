import { Inject, Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { APP_TIMEZONE, EnumScopeType, ScopeAsync } from 'lib/nest-core'
import { USER_AUTH_TOKEN } from '../constants'
import { AuthService } from '../services'

@Injectable()
export class UserTask {
  constructor(@Inject(USER_AUTH_TOKEN) private readonly authService: AuthService) {}

  @Cron(CronExpression.EVERY_MINUTE, { timeZone: APP_TIMEZONE })
  @ScopeAsync(EnumScopeType.CRON, { context: 'cron.user_clean_up_expired_refresh_tokens' })
  async clearExpiredRefreshTokens() {
    await this.authService.cleanUpRefreshTokens()
  }

  @Cron(CronExpression.EVERY_MINUTE, { timeZone: APP_TIMEZONE })
  @ScopeAsync(EnumScopeType.CRON, { context: 'cron.user_clean_up_pass_atempts' })
  async clearPasswordAttempts() {
    await this.authService.cleanUpPasswordAttempts()
  }
}
