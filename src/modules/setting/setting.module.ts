import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ENUM_APP_CMD_TYPE, ModuleBase } from 'lib/nest-core'
import { SettingSeedCommand } from './commands'
import { SettingAdminController } from './controllers'
import { SettingMaintenanceMiddleware } from './middleware'
import { SettingService } from './services'

@Module({
  exports: [SettingService],
  providers: [SettingService],
  imports: [],
})
export class SettingModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [SettingAdminController],
  }
  static _commands = {
    [ENUM_APP_CMD_TYPE.SEED]: [SettingSeedCommand],
  }

  static middleware(consumer: MiddlewareConsumer) {
    SettingMaintenanceMiddleware.configure(consumer) // Enable check maintenance mode
  }
}
