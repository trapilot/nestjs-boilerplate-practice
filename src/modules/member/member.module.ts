import { Module } from '@nestjs/common'
import { MEMBER_AUTH_TOKEN } from './constants'
import { AuthService, MemberService, VerifyService } from './services'

@Module({
  providers: [
    {
      provide: MEMBER_AUTH_TOKEN,
      useClass: AuthService,
    },
    MemberService,
    VerifyService,
  ],
  exports: [MEMBER_AUTH_TOKEN, MemberService, VerifyService],
  imports: [],
})
export class MemberModule {}
