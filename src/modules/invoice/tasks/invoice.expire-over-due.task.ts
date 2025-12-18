import { Injectable } from '@nestjs/common'
import { Cron, CronExpression, CronOptions } from '@nestjs/schedule'
import { ENUM_INVOICE_STATUS, ENUM_PAYMENT_METHOD } from '@prisma/client'
import { APP_TIMEZONE, DateService } from 'lib/nest-core'
import { LoggerService } from 'lib/nest-logger'
import { InvoiceService } from '../services'

const cronTime = process.env.CRONTAB_INVOICE_EXPIRE_OVER_DUE
const cronName = 'task_invoice_expire_over_due'
const cronOptions: CronOptions = {
  name: cronName,
  timeZone: APP_TIMEZONE,
}

@Injectable()
export class InvoiceExpireOverDueTask {
  constructor(
    private readonly logger: LoggerService,
    private readonly dateService: DateService,
    private readonly invoiceService: InvoiceService,
  ) {
    this.logger.setContext(cronName)
  }

  @Cron(cronTime || CronExpression.EVERY_DAY_AT_MIDNIGHT, cronOptions)
  async execute() {
    const dateNow = this.dateService.create()
    this.logger.info(`${InvoiceExpireOverDueTask.name} ${dateNow}`, cronName)

    // Process task
    await this.invoiceService.expireOverDue(dateNow)
  }

  @Cron(CronExpression.EVERY_10_MINUTES, {
    disabled: process.env.INVOICE_AUTO_ADD_PAYMENT !== 'true',
  })
  async cronToAddPayment(): Promise<void> {
    const dateNow = this.dateService.create()
    const methods = Object.values(ENUM_PAYMENT_METHOD)
    const invoices = await this.invoiceService.findAll({
      where: { status: ENUM_INVOICE_STATUS.PARTIALLY_PAID },
      take: 10,
    })

    for (const invoice of invoices) {
      const amountRemaining = invoice.finalPrice - invoice.paidPrice
      const amountRandom = Math.floor(Math.random() * amountRemaining) + 1
      await this.invoiceService.addPayment(invoice, {
        method: methods[Math.floor(Math.random() * methods.length)],
        amount: amountRemaining <= 1_000 ? amountRemaining : amountRandom,
        issuedAt: this.dateService.backward(dateNow, { days: 2 }),
      })
    }
  }
}
