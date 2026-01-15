import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { APP_TIMEZONE, EnumScopeType, HelperService, OnScope } from 'lib/nest-core'
import { InvoiceService } from '../services'

@Injectable()
export class InvoiceTask {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly helperService: HelperService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: APP_TIMEZONE,
  })
  @OnScope(EnumScopeType.CRON, {
    context: 'cron.invoice_handle_expire_over_due',
    async: true,
  })
  async handleOverDueInvoice(): Promise<void> {
    const nowDate = this.helperService.dateNow()
    const chkDate = this.helperService.dateCreate(nowDate, {
      endOfDay: true,
    })

    await this.invoiceService.expireOverDue(chkDate)
  }
}
