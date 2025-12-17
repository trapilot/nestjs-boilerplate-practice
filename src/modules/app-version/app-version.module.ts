import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ENUM_APP_CMD_TYPE, ModuleBase } from 'lib/nest-core'
import { AppVersionSeedCommand } from './commands'
import { AppVersionAdminController } from './controllers'
import { AppVersionMiddleware } from './middleware'
import { AppVersionService } from './services'

@Module({
  providers: [AppVersionService],
  exports: [AppVersionService],
  imports: [],
})
export class AppVersionModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [AppVersionAdminController],
  }
  static _commands = {
    [ENUM_APP_CMD_TYPE.SEED]: [AppVersionSeedCommand],
  }

  static configure(consumer: MiddlewareConsumer) {
    AppVersionMiddleware.configure(consumer) // Enable check mobile app version
  }
}
