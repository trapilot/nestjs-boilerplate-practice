import { Injectable } from '@nestjs/common'
import { EnumInvoiceStatus } from '@runtime/prisma-client'
import { HelperService, IQueueHandler, LoggerService, QueueScanner } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { EnumInvoiceQueue } from '../enums/invoice.enum'
import { InvoiceService } from '../services/invoice.service'

@Injectable()
export class InvoiceRejectOverDueHandler implements IQueueHandler {
  topic: string = EnumInvoiceQueue.REJECT_OVER_DUE
  version: number = 1

  constructor(
    private readonly logger: LoggerService,
    private readonly scanner: QueueScanner,
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly invoiceService: InvoiceService,
  ) {}

  async handle(): Promise<void> {
    this.logger.log(`${this.topic}:v${this.version} is handling...`)

    const nowDate = this.helperService.dateNow()

    await this.scanner.runWithCursor({
      topic: this.topic,
      version: this.version,

      retrieve: async state => {
        return await this.prisma.invoice.findMany({
          where: {
            status: {
              in: [EnumInvoiceStatus.PENDING, EnumInvoiceStatus.PARTIALLY_PAID],
            },
            dueDate: { lte: nowDate },
          },
          cursor: state.lastId ? { id: state.lastId } : undefined,
          select: { id: true },
          take: 500,
        })
      },

      process: async invoices => {
        const invoiceIds = invoices.map(i => i.id)
        await this.invoiceService.rejectOverDue(invoiceIds)
      },

      getLastId: invoices => invoices[invoices.length - 1]?.id,
    })
  }
}
