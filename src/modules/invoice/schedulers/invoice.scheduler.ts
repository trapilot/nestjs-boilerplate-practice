import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { HelperService } from 'lib/nest-core'
import { InvoiceService } from '../services/invoice.service'

@Injectable()
export class InvoiceScheduler {
  constructor(
    private readonly helperService: HelperService,
    private readonly invoiceService: InvoiceService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async rejectOverDue(): Promise<void> {
    await this.invoiceService.enqueueScanOverDueInvoices({
      startDate: this.helperService.dateEnd(),
    })
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async earnPoint(): Promise<void> {
    await this.invoiceService.enqueueScanEarnPointInvoices({
      startDate: this.helperService.dateEnd(),
    })
  }
}
