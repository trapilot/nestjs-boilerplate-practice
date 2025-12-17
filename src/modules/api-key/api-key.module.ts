import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ENUM_APP_CMD_TYPE, ModuleBase } from 'lib/nest-core'
import { ApiKeySeedCommand } from './commands'
import { ApiKeyAdminController } from './controllers'
import { ApiKeyService } from './services'

@Module({
  providers: [ApiKeyService],
  exports: [ApiKeyService],
  imports: [],
})
export class ApiKeyModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [ApiKeyAdminController],
  }
  static _commands = {
    [ENUM_APP_CMD_TYPE.SEED]: [ApiKeySeedCommand],
  }
}
