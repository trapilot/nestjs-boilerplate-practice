import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { NotificationAdminController } from './controllers'
import { NotificationService } from './services'

@Module({
  providers: [NotificationService],
  exports: [NotificationService],
  imports: [],
})
export class NotificationModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [NotificationAdminController],
  }
}
