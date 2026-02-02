import { Injectable } from '@nestjs/common'
import { EnumInvoiceStatus, QueueCursor } from '@runtime/prisma-client'
import {
  EnumQueuePriority,
  HelperService,
  IQueueHandler,
  LoggerService,
  QueueProducer,
  QueueScanner,
} from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { EnumInvoiceQueue } from '../enums/invoice.enum'
import { InvoiceService } from '../services/invoice.service'

@Injectable()
export class InvoiceRejectOverDueHandler implements IQueueHandler {
  topic: string = EnumInvoiceQueue.REJECT_OVER_DUE
  version: number = 1

  constructor(
    private readonly logger: LoggerService,
    private readonly producer: QueueProducer,
    private readonly scanner: QueueScanner,
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly invoiceService: InvoiceService,
  ) {}

  async handle(): Promise<void> {
    this.logger.log(`${this.topic}:v${this.version} is handling...`)

    const nowDate = this.helperService.dateNow()
    const state = await this.scanner.scan<QueueCursor>(this.topic, this.version)

    const invoices = await this.prisma.invoice.findMany({
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

    const invoiceIds = invoices.map(i => i.id)
    if (!invoiceIds.length) {
      // reset cursor to start over next time.
      this.logger.log(`${this.topic}:v${this.version} completed`)
      await this.scanner.reset(this.topic, this.version)
      return
    }

    // handle job
    await this.invoiceService.rejectOverDue(invoiceIds)

    // update cursor
    await this.scanner.commit(this.topic, {
      version: this.version,
      batchId: state.batchId + 1,
      lastId: invoiceIds[invoiceIds.length - 1],
    })

    // republish queue job
    this.logger.log(`${this.topic}:v${this.version}:${state.batchId} republish`)
    await this.producer.republish(this.topic, {
      version: this.version,
      priority: EnumQueuePriority.HIGH,
    })
  }
}
