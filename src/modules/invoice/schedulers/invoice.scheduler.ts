import { Injectable } from '@nestjs/common'
import { CronExpression } from '@nestjs/schedule'
import {
  EnumQueuePriority,
  HelperService,
  IScheduler,
  ISchedulerBus,
  QueueProducer,
} from 'lib/nest-core'
import { EnumMemberQueue } from 'modules/member/enums/member.enum'
import { IMemberEarnPurchasePayload } from 'modules/member/interfaces/member.interface'
import { EnumInvoiceQueue } from '../enums/invoice.enum'
import { InvoiceService } from '../services/invoice.service'

@Injectable()
export class InvoiceScheduler implements IScheduler {
  constructor(
    private readonly producer: QueueProducer,
    private readonly helperService: HelperService,
    private readonly invoiceService: InvoiceService,
  ) {}

  register(bus: ISchedulerBus): void {
    const nowDate = this.helperService.dateNow()

    bus.cron(CronExpression.EVERY_10_MINUTES, async () => {
      await this.producer.publish(EnumInvoiceQueue.REJECT_OVER_DUE, {
        version: 1,
        priority: EnumQueuePriority.MEDIUM,
        startDate: this.helperService.dateEnd(),
        exclusive: true,
      })
    })

    bus.cron(CronExpression.EVERY_MINUTE, async () => {
      const invoices = await this.invoiceService.getEarnInvoices(nowDate)

      if (invoices.length) {
        await this.producer.publish<IMemberEarnPurchasePayload>(
          EnumMemberQueue.EARN_POINT_FROM_PURCHASE,
          {
            version: 1,
            priority: EnumQueuePriority.MEDIUM,
            startDate: nowDate,
            message: {
              invoiceIds: invoices.map(i => i.id),
              issuedAt: nowDate,
            },
          },
        )
      }
    })
  }
}
