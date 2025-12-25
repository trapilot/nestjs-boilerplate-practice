import { Injectable } from '@nestjs/common'
import { Cron, CronExpression, CronOptions } from '@nestjs/schedule'
import { APP_TIMEZONE, HelperService } from 'lib/nest-core'
import { LoggerService } from 'lib/nest-logger'
import { MemberService } from '../services'

const cronTime = process.env.CRONTAB_MEMBER_RESET_BIRTH_PURCHASED
const cronName = 'task_reset_member_has_birth_purchased'
const cronOptions: CronOptions = {
  name: cronName,
  timeZone: APP_TIMEZONE,
}

@Injectable()
export class MemberEarnHighestBirthPurchasedTask {
  constructor(
    private readonly logger: LoggerService,
    private readonly memberService: MemberService,
    private readonly helperService: HelperService,
  ) {
    this.logger.setContext(cronName)
  }

  @Cron(cronTime || CronExpression.EVERY_DAY_AT_1AM, cronOptions)
  async execute() {
    const dateNow = this.helperService.dateCreate()
    this.logger.info(`${MemberEarnHighestBirthPurchasedTask.name} ${dateNow}`, cronName)

    // Process task
    await this.memberService.earnHighestBirthInvoice(dateNow)
  }
}
