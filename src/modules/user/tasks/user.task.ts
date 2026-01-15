import { Inject, Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { APP_TIMEZONE, EnumScopeType, OnScope } from 'lib/nest-core'
import { USER_AUTH_TOKEN } from '../constants'
import { AuthService } from '../services'

@Injectable()
export class UserTask {
  constructor(@Inject(USER_AUTH_TOKEN) private readonly authService: AuthService) {}

  @Cron(CronExpression.EVERY_MINUTE, { timeZone: APP_TIMEZONE })
  @OnScope(EnumScopeType.CRON, { context: 'cron.user_clean_expired_refresh_tokens', async: true })
  async clearExpiredRefreshTokens(): Promise<void> {
    await this.authService.cleanUpRefreshTokens()
  }

  @Cron(CronExpression.EVERY_MINUTE, { timeZone: APP_TIMEZONE })
  @OnScope(EnumScopeType.CRON, { context: 'cron.user_clean_pass_atempts' })
  async clearPasswordAttempts(): Promise<void> {
    await this.authService.cleanUpPasswordAttempts()
  }
}
