import { Module } from '@nestjs/common'
import { USER_AUTH_TOKEN } from './constants'
import { AuthService, UserService } from './services'

@Module({
  providers: [
    {
      provide: USER_AUTH_TOKEN,
      useClass: AuthService,
    },
    UserService,
  ],
  exports: [USER_AUTH_TOKEN, UserService],
  imports: [],
})
export class UserModule {}
