import { Module } from '@nestjs/common'
import { NotificationUtil } from './helpers/notification.util'
import { NotificationScheduler } from './schedulers/notification.scheduler'
import { NotificationService } from './services/notification.service'

@Module({
  providers: [NotificationService, NotificationUtil, NotificationScheduler],
  exports: [NotificationService, NotificationUtil],
  imports: [],
})
export class NotificationModule {}
