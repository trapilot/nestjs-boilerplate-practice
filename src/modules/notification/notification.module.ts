import { Module } from '@nestjs/common'
import { NotificationUtil } from './helpers'
import { NotificationService } from './services'

@Module({
  providers: [NotificationService, NotificationUtil],
  exports: [NotificationService, NotificationUtil],
  imports: [],
})
export class NotificationModule {}
