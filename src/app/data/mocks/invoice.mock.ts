import { Injectable } from '@nestjs/common'
import { EnumInvoiceStatus, EnumPaymentMethod } from '@runtime/prisma-client'
import { HelperService, ScheduleMockupBase } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { InvoiceService } from 'modules/invoice/services/invoice.service'

@Injectable()
export class InvoiceMock extends ScheduleMockupBase {
  private readonly nowDate: Date

  constructor(
    private readonly prisma: PrismaService,
    private readonly invoiceService: InvoiceService,
    private readonly helperService: HelperService,
  ) {
    super()

    this.nowDate = this.helperService.dateNow()
  }

  async mockup(): Promise<void> {
    const methods = Object.values(EnumPaymentMethod)
    const lastInvoice = await this.prisma.invoice.findFirst({
      select: { id: true },
      orderBy: [{ id: 'desc' }],
    })

    const invoices = await this.invoiceService.getMany({
      where: {
        status: EnumInvoiceStatus.PARTIALLY_PAID,
        id: {
          gt: this.helperService.randomNumber({ min: 1, max: lastInvoice.id }),
        },
      },
      take: 100,
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
  }

  async mockable(): Promise<boolean> {
    const invoiceNumbers = await this.prisma.invoice.count({
      where: { status: EnumInvoiceStatus.PARTIALLY_PAID },
    })
    return invoiceNumbers > 0
  }
}
