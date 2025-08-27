import { Module } from '@nestjs/common'
import { ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import { MemberGateway } from 'src/app/gateway'
import { MemberAuthListener } from './listeners'
import { MemberAuthService, MemberVerificationService } from './services'

@Module({
  providers: [
    {
      provide: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      useClass: MemberAuthService,
    },
    MemberVerificationService,
    MemberAuthListener,
    MemberGateway,
  ],
  exports: [ENUM_AUTH_SCOPE_TYPE.MEMBER],
  imports: [],
})
export class MemberAuthModule {}
