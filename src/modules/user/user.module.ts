import { Module } from '@nestjs/common'
import { RoleModule } from 'modules/role/role.module'
import { USER_AUTH_TOKEN } from './constants/users.constant'
import { UserAuth } from './helpers/user.auth'
import { UserService } from './services/user.service'

@Module({
  providers: [
    {
      provide: USER_AUTH_TOKEN,
      useClass: UserAuth,
    },
    UserService,
  ],
  exports: [USER_AUTH_TOKEN, UserService],
  imports: [RoleModule],
})
export class UserModule {}
