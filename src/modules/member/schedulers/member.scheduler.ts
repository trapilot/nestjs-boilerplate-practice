import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { HelperService } from 'lib/nest-core'
import { MemberService } from '../services/member.service'

@Injectable()
export class MemberScheduler {
  constructor(
    private readonly memberService: MemberService,
    private readonly helperService: HelperService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async releasePendingPoints(): Promise<void> {
    await this.memberService.enqueueScanExpiredMembers({
      startDate: this.helperService.dateEnd(),
    })
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async scanExpiredMembers(): Promise<void> {
    await this.memberService.enqueueScanPendingPoints({
      startDate: this.helperService.dateEnd(),
    })
  }
}
