import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { EnumQueuePriority, HelperService, QueueProducer } from 'lib/nest-core'
import { EnumMemberQueue } from '../enums/member.enum'

@Injectable()
export class MemberScheduler {
  constructor(
    private readonly producer: QueueProducer,
    private readonly helperService: HelperService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleEarnHighestPurchaseInBirth(): Promise<void> {
    await this.producer.publish(EnumMemberQueue.EARN_HIGHEST_PURCHASE_IN_BIRTH, {
      version: 1,
      exclusive: true,
      autoDelete: true,
      priority: EnumQueuePriority.HIGH,
      startDate: this.helperService.dateEnd(),
    })
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleEarnPointFromPurchase(): Promise<void> {
    await this.producer.publish(EnumMemberQueue.EARN_POINT_FROM_PURCHASE, {
      version: 1,
      exclusive: true,
      autoDelete: true,
      priority: EnumQueuePriority.HIGH,
      startDate: this.helperService.dateEnd(),
    })
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleReleaseMemberPoints(): Promise<void> {
    await this.producer.publish(EnumMemberQueue.RELEASE_EXPIRY_POINTS, {
      version: 1,
      exclusive: true,
      autoDelete: true,
      priority: EnumQueuePriority.HIGH,
      startDate: this.helperService.dateEnd(),
    })
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleResetPoints(): Promise<void> {
    await this.producer.publish(EnumMemberQueue.RESET_EXPIRY_POINTS, {
      version: 1,
      exclusive: true,
      autoDelete: true,
      priority: EnumQueuePriority.HIGH,
      startDate: this.helperService.dateEnd(),
    })
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async scanExpiredMembers(): Promise<void> {
    await this.producer.publish(EnumMemberQueue.SCAN_EXPIRED, {
      version: 1,
      exclusive: true,
      autoDelete: true,
      priority: EnumQueuePriority.HIGH,
      startDate: this.helperService.dateEnd(),
    })
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleResetBirthPurchseEveryYear(): Promise<void> {
    await this.producer.publish(EnumMemberQueue.RESET_BIRTH_PURCHASE, {
      version: 1,
      exclusive: true,
      autoDelete: true,
      priority: EnumQueuePriority.HIGH,
      startDate: this.helperService.dateEnd(),
    })
  }
}
