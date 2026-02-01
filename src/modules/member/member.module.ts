import { Module } from '@nestjs/common'
import { TierModule } from 'modules/tier'
import { MEMBER_AUTH_TOKEN } from './constants'
import { MemberAuth, MemberUtil } from './helpers'
import { MemberService } from './services'

@Module({
  providers: [
    {
      provide: MEMBER_AUTH_TOKEN,
      useClass: MemberAuth,
    },
    MemberService,
    MemberUtil,
  ],
  exports: [MEMBER_AUTH_TOKEN, MemberService, MemberUtil],
  imports: [TierModule],
})
export class MemberModule {}
