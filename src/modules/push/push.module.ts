import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { PushAdminController } from './controllers'
import { PushService } from './services'
import { PushSendNotificationTask } from './tasks'

@Module({
  providers: [PushService],
  exports: [PushService],
  imports: [],
})
export class PushModule extends ModuleBase {
  static _tasks = [PushSendNotificationTask]
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [PushAdminController],
  }
}
