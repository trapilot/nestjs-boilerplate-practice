import { Injectable } from '@nestjs/common'
import { Cron, CronExpression, CronOptions } from '@nestjs/schedule'
import { APP_TIMEZONE, DateService } from 'lib/nest-core'
import { LoggerService } from 'lib/nest-logger'
import { MemberService } from '../services'

const cronTime = process.env.CRONTAB_MEMBER_RESET_TIER
const cronName = 'task_member_reset_tier'
const cronOptions: CronOptions = {
  name: cronName,
  timeZone: APP_TIMEZONE,
}

@Injectable()
export class MemberResetTierTask {
  constructor(
    private readonly logger: LoggerService,
    private readonly memberService: MemberService,
    private readonly dateService: DateService,
  ) {
    this.logger.setContext(cronName)
  }

  @Cron(cronTime || CronExpression.EVERY_DAY_AT_MIDNIGHT, cronOptions)
  async execute() {
    const dateNow = this.dateService.create()
    this.logger.info(`${MemberResetTierTask.name} ${dateNow}`, cronName)

    // Process task
    await this.memberService.resetMemberTier(dateNow)
  }
}
