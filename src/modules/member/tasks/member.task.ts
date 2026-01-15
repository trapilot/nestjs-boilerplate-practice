import { Inject, Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { APP_TIMEZONE, EnumScopeType, HelperService, OnScope } from 'lib/nest-core'
import { MEMBER_AUTH_TOKEN } from '../constants'
import { AuthService, MemberService, VerifyService } from '../services'

@Injectable()
export class MemberTask {
  constructor(
    @Inject(MEMBER_AUTH_TOKEN) private readonly authService: AuthService,
    private readonly memberService: MemberService,
    private readonly verifyService: VerifyService,
    private readonly helperService: HelperService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, { timeZone: APP_TIMEZONE })
  @OnScope(EnumScopeType.CRON, { context: 'cron.member_clean_refresh_tokens', async: true })
  async cleanUpRefreshTokens(): Promise<void> {
    await this.authService.cleanUpRefreshTokens()
  }

  @Cron(CronExpression.EVERY_MINUTE, { timeZone: APP_TIMEZONE })
  @OnScope(EnumScopeType.CRON, { context: 'cron.member_clean_verify_tokens', async: true })
  async cleanUpVerifyTokens(): Promise<void> {
    await this.verifyService.cleanUpVerifyTokens()
  }

  @Cron(CronExpression.EVERY_MINUTE, { timeZone: APP_TIMEZONE })
  @OnScope(EnumScopeType.CRON, {
    context: 'cron.member_earn_highest_purchase_in_birth',
    async: true,
  })
  async handleEarnHighestPurchaseInBirth(): Promise<void> {
    const chkDate = this.helperService.dateNow()

    await this.memberService.earnHighestBirthInvoice(chkDate)
  }

  @Cron(CronExpression.EVERY_MINUTE, { timeZone: APP_TIMEZONE })
  @OnScope(EnumScopeType.CRON, { context: 'cron.member_earn_point_from_purchases', async: true })
  async handleEarnPointFromPurchase(): Promise<void> {
    const chkDate = this.helperService.dateNow()

    await this.memberService.earnPointFromInvoices(chkDate)
  }

  @Cron(CronExpression.EVERY_MINUTE, { timeZone: APP_TIMEZONE })
  @OnScope(EnumScopeType.CRON, { context: 'cron.member_release_points', async: true })
  async handleReleaseMemberPoints(): Promise<void> {
    const chkDate = this.helperService.dateNow()

    await this.memberService.releaseMemberPoints(chkDate)
  }

  @Cron(CronExpression.EVERY_MINUTE, { timeZone: APP_TIMEZONE })
  @OnScope(EnumScopeType.CRON, { context: 'cron.member_reset_points', async: true })
  async handleResetPoints(): Promise<void> {
    const chkDate = this.helperService.dateNow()

    await this.memberService.resetMemberPoints(chkDate)
  }

  @Cron(CronExpression.EVERY_MINUTE, { timeZone: APP_TIMEZONE })
  @OnScope(EnumScopeType.CRON, { context: 'cron.member_reset_tiers', async: true })
  async handleResetTiers(): Promise<void> {
    const chkDate = this.helperService.dateNow()

    await this.memberService.resetMemberTiers(chkDate)
  }

  @Cron(CronExpression.EVERY_MINUTE, { timeZone: APP_TIMEZONE })
  @OnScope(EnumScopeType.CRON, { context: 'cron.member_reset_birth_purchase', async: true })
  async handleResetBirthPurchseEveryYear(): Promise<void> {
    const chkDate = this.helperService.dateNow()

    await this.memberService.resetBirthPurchased(chkDate)
  }
}
