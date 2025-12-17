import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { TierHistoryAdminController } from './controllers'
import { TierHistoryService } from './services'

@Module({
  providers: [TierHistoryService],
  exports: [TierHistoryService],
  imports: [],
})
export class TierHistoryModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [TierHistoryAdminController],
  }
}
