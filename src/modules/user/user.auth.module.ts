import { Module } from '@nestjs/common'
import { ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
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
export class UserAuthModule {}
