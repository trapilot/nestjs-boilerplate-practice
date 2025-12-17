import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ENUM_APP_CMD_TYPE, ModuleBase } from 'lib/nest-core'
import { RoleMigrateCommand, RoleSeedCommand } from './commands'
import { RoleAdminController } from './controllers'
import { RoleService } from './services'

@Module({
  providers: [RoleService],
  exports: [RoleService],
  imports: [],
})
export class RoleModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [RoleAdminController],
  }
  static _commands = {
    [ENUM_APP_CMD_TYPE.SEED]: [RoleSeedCommand],
    [ENUM_APP_CMD_TYPE.MIGRATE]: [RoleMigrateCommand],
  }
}
