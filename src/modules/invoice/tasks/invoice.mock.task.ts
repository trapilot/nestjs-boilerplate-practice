import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { EnumInvoiceStatus, EnumPaymentMethod } from '@runtime/prisma-client'
import { EnumScopeType, HelperService, LoggerService, ScopeAsync, StrUtil } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { InvoiceService } from '../services'

@Injectable()
export class InvoiceMockTask {
  private readonly nowDate: Date

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly invoiceService: InvoiceService,
    private readonly helperService: HelperService
  ) {
    this.nowDate = this.helperService.dateNow()
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    disabled: StrUtil.isNotTrue(process.env.AUTO_GEN_MODE),
  })
  @ScopeAsync(EnumScopeType.CRON, {
    context: 'cron.invoice_mockup_random_paid',
  })
  async mockup(): Promise<void> {
    this.logger.log(`${InvoiceMockTask.name} is running`)
    const canRun = await this.canRun()
    if (!canRun) {
      this.logger.warn(`${InvoiceMockTask.name} stopped`)
      return
    }

    try {
      const methods = Object.values(EnumPaymentMethod)
      const invoices = await this.invoiceService.findAll({
        where: { status: EnumInvoiceStatus.PARTIALLY_PAID },
        take: 10,
      })

      for (const invoice of invoices) {
        const amountRemaining = invoice.finalPrice - invoice.paidPrice
        const amountRandom = Math.floor(Math.random() * amountRemaining) + 1
        await this.invoiceService.addPayment(invoice, {
          method: methods[Math.floor(Math.random() * methods.length)],
          amount: amountRemaining <= 1_000 ? amountRemaining : amountRandom,
          issuedAt: this.helperService.dateBackward(this.nowDate, { days: 2 }),
        })
      }
    } catch (err: unknown) {
      this.logger.error(err)
    } finally {
      this.logger.warn(`${InvoiceMockTask.name} done`)
    }
  }

  private async canRun(): Promise<boolean> {
    const invoiceNumbers = await this.prisma.invoice.count({
      where: { status: EnumInvoiceStatus.PARTIALLY_PAID },
    })
    return invoiceNumbers > 0
  }
}
