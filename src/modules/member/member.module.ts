import { Module } from '@nestjs/common'
import { MemberPointModule } from 'modules/member-point/member-point.module'
import { MemberTierModule } from 'modules/member-tier/member-tier.module'
import { TierModule } from 'modules/tier/tier.module'
import { MEMBER_AUTH_TOKEN } from './constants/member.constant'
import { MemberAuth } from './helpers/member.auth'
import { MemberUtil } from './helpers/member.util'
import { MemberListener } from './listeners/member.listener'
import { MemberScheduler } from './schedulers/member.scheduler'
import { MemberService } from './services/member.service'

@Module({
  providers: [
    {
      provide: MEMBER_AUTH_TOKEN,
      useClass: MemberAuth,
    },
    MemberService,
    MemberUtil,
    MemberScheduler,
    MemberListener,
  ],
  exports: [MEMBER_AUTH_TOKEN, MemberService],
  imports: [TierModule, MemberPointModule, MemberTierModule],
})
export class MemberModule {}
