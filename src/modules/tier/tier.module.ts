import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ENUM_APP_CMD_TYPE, ModuleBase } from 'lib/nest-core'
import { TierSeedCommand } from './commands'
import { TierAdminController, TierAppController } from './controllers'
import { TierService } from './services'

@Module({
  providers: [TierService],
  exports: [TierService],
  imports: [],
})
export class TierModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [TierAdminController],
    [ENUM_APP_API_TYPE.APP]: [TierAppController],
  }
  static _commands = {
    [ENUM_APP_CMD_TYPE.SEED]: [TierSeedCommand],
  }
}
