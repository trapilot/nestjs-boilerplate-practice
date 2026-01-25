import { Module } from '@nestjs/common'
import { USER_AUTH_TOKEN } from './constants'
import { UserAuth } from './helpers'
import { UserService } from './services'

@Module({
  providers: [
    {
      provide: USER_AUTH_TOKEN,
      useClass: UserAuth,
    },
    UserService,
  ],
  exports: [USER_AUTH_TOKEN, UserService],
  imports: [],
})
export class UserModule {}
