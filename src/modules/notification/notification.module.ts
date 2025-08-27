import { Module } from '@nestjs/common'
import { NotificationService } from './services'

@Module({
  providers: [NotificationService],
  exports: [NotificationService],
  imports: [],
})
export class NotificationModule {}
