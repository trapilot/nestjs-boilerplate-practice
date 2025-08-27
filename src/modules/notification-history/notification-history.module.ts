import { Module } from '@nestjs/common'
import { NotificationHistoryService } from './services'

@Module({
  providers: [NotificationHistoryService],
  exports: [NotificationHistoryService],
  imports: [],
})
export class NotificationHistoryModule {}
