import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ENUM_APP_CMD_TYPE, ModuleBase } from 'lib/nest-core'
import { UserSeedCommand } from './commands'
import { UserAdminController } from './controllers'
import { UserService } from './services'

@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [],
})
export class UserModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [UserAdminController],
  }
  static _commands = {
    [ENUM_APP_CMD_TYPE.SEED]: [UserSeedCommand],
  }
}
