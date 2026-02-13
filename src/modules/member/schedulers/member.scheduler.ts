import { Injectable } from '@nestjs/common'
import { CronExpression } from '@nestjs/schedule'
import {
  EnumQueuePriority,
  HelperService,
  IScheduler,
  ISchedulerBus,
  QueueProducer,
} from 'lib/nest-core'
import { EnumMemberQueue } from '../enums/member.enum'

@Injectable()
export class MemberScheduler implements IScheduler {
  constructor(
    private readonly producer: QueueProducer,
    private readonly helperService: HelperService,
  ) {}

  register(bus: ISchedulerBus): void {
    bus.cron(CronExpression.EVERY_MINUTE, async () => {
      await this.producer.publish(EnumMemberQueue.RELEASE_PENDING_POINTS, {
        version: 1,
        priority: EnumQueuePriority.HIGH,
        startDate: this.helperService.dateEnd(),
        exclusive: true,
      })
    })

    bus.cron(CronExpression.EVERY_MINUTE, async () => {
      await this.producer.publish(EnumMemberQueue.SCAN_EXPIRED, {
        version: 1,
        priority: EnumQueuePriority.HIGH,
        startDate: this.helperService.dateEnd(),
        exclusive: true,
      })
    })
  }
}
