import { Module } from '@nestjs/common'
import { ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { UserAuthController } from './controllers'
import { UserAuthService } from './services'

@Module({
  providers: [
    {
      provide: ENUM_AUTH_SCOPE_TYPE.USER,
      useClass: UserAuthService,
    },
  ],
  exports: [ENUM_AUTH_SCOPE_TYPE.USER],
  imports: [],
})
export class UserAuthModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [UserAuthController],
  }
}
