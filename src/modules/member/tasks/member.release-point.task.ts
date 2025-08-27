import { Injectable } from '@nestjs/common'
import { Cron, CronExpression, CronOptions } from '@nestjs/schedule'
import { LoggerService } from 'lib/nest-logger'
import { APP_TIMEZONE, HelperDateService } from 'lib/nest-core'
import { MemberService } from '../services'

const cronTime = process.env.CRONTAB_MEMBER_RELEASE_POINT
const cronName = 'task_member_release_point'
const cronOptions: CronOptions = {
  name: cronName,
  timeZone: APP_TIMEZONE,
}

@Injectable()
export class MemberReleasePointTask {
  constructor(
    private readonly logger: LoggerService,
    private readonly memberService: MemberService,
    private readonly helperDateService: HelperDateService,
  ) {
    this.logger.setContext(cronName)
  }

  @Cron(cronTime || CronExpression.EVERY_DAY_AT_MIDNIGHT, cronOptions)
  async execute() {
    const dateNow = this.helperDateService.create()
    this.logger.info(`${MemberReleasePointTask.name} ${dateNow}`, cronName)

    // Process task
    await this.memberService.releaseMemberPoint(dateNow)
  }
}
