import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { DashboardAdminController } from './controllers'
import { DashboardService } from './services'

@Module({
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [DashboardAdminController],
  }
}
