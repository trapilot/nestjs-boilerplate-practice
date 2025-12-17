import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ENUM_APP_CMD_TYPE, ModuleBase } from 'lib/nest-core'
import { PermissionSeedCommand } from './commands'
import { PermissionAdminController } from './controllers'
import { PermissionService } from './services'

@Module({
  providers: [PermissionService],
  exports: [PermissionService],
  imports: [],
})
export class PermissionModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [PermissionAdminController],
  }
  static _commands = {
    [ENUM_APP_CMD_TYPE.SEED]: [PermissionSeedCommand],
  }
}
