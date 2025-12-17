import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ENUM_APP_CMD_TYPE, ModuleBase } from 'lib/nest-core'
import { FactSeedCommand } from './commands'
import { FactAdminController, FactAppController } from './controllers'
import { FactService } from './services'

@Module({
  providers: [FactService],
  exports: [FactService],
  imports: [],
})
export class FactModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [FactAdminController],
    [ENUM_APP_API_TYPE.APP]: [FactAppController],
  }
  static _commands = {
    [ENUM_APP_CMD_TYPE.SEED]: [FactSeedCommand],
  }
}
