import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { HelperService } from 'lib/nest-core'
import { NotificationService } from '../services/notification.service'

@Injectable()
export class NotificationScheduler {
  constructor(
    private readonly helperService: HelperService,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async scanPendingPush(): Promise<void> {
    await this.notificationService.enqueueScanPendingPush({
      startDate: this.helperService.dateEnd(),
    })
  }
}
