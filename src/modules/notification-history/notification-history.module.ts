import { Module } from '@nestjs/common'
import { ModuleBase } from 'lib/nest-core'
import { NotificationHistoryService } from './services'

@Module({
  providers: [NotificationHistoryService],
  exports: [NotificationHistoryService],
  imports: [],
})
export class NotificationHistoryModule extends ModuleBase {}
