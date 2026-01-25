import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { EnumQueuePriority, HelperService, QueueProducer } from 'lib/nest-core'
import { EnumInvoiceQueue } from '../enums'

@Injectable()
export class InvoiceScheduler {
  constructor(
    private readonly producer: QueueProducer,
    private readonly helperService: HelperService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleOverDueInvoice(): Promise<void> {
    await this.producer.publish(EnumInvoiceQueue.REJECT_OVER_DUE, {
      version: 1,
      exclusive: true,
      autoDelete: true,
      priority: EnumQueuePriority.MEDIUM,
      startDate: this.helperService.dateEnd(),
    })
  }
}
