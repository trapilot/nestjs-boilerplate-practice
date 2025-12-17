import { Module } from '@nestjs/common'
import { MemberGateway } from 'app/gateway'
import { ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { MemberAuthController } from './controllers'
import { MemberAuthService, MemberVerificationService } from './services'

@Module({
  providers: [
    {
      provide: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      useClass: MemberAuthService,
    },
    MemberVerificationService,
    MemberGateway,
  ],
  exports: [ENUM_AUTH_SCOPE_TYPE.MEMBER],
  imports: [],
})
export class MemberAuthModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.APP]: [MemberAuthController],
  }
}
