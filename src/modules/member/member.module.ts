import { Module } from '@nestjs/common'
import { TierModule } from 'modules/tier'
import { MEMBER_AUTH_TOKEN } from './constants'
import { MemberAuth, MemberUtil } from './helpers'
import { MemberService, VerificationService } from './services'

@Module({
  providers: [
    {
      provide: MEMBER_AUTH_TOKEN,
      useClass: MemberAuth,
    },
    MemberService,
    VerificationService,
    MemberUtil,
  ],
  exports: [MEMBER_AUTH_TOKEN, MemberService, VerificationService, MemberUtil],
  imports: [TierModule],
})
export class MemberModule {}
