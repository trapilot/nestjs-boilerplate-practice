import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { PointHistoryAdminController, PointHistoryAppController } from './controllers'
import { PointHistoryService } from './services'

@Module({
  providers: [PointHistoryService],
  exports: [PointHistoryService],
  imports: [],
})
export class PointHistoryModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [PointHistoryAdminController],
    [ENUM_APP_API_TYPE.APP]: [PointHistoryAppController],
  }
}
