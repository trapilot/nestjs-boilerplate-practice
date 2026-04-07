import { Injectable } from '@nestjs/common'
import {
  EnumQueuePriority,
  HelperService,
  IWorkerHandler,
  LoggerService,
  WorkerProducer,
  WorkerScanner,
} from 'lib/nest-core'
import { MEMBER_QUEUE_SCAN_VERSION } from 'modules/member/constants/member.constant'
import { INVOICE_QUEUE_PROC_VERSION } from '../constants/invoice.constant'
import { EnumInvoiceQueue } from '../enums/invoice.enum'
import { InvoiceService } from '../services/invoice.service'

@Injectable()
export class InvoiceScanEarnPointsHandler implements IWorkerHandler {
  topic: string = EnumInvoiceQueue.SCAN_EARN_POINTS
  version: number = MEMBER_QUEUE_SCAN_VERSION[EnumInvoiceQueue.SCAN_EARN_POINTS]

  constructor(
    private readonly logger: LoggerService,
    private readonly scanner: WorkerScanner,
    private readonly producer: WorkerProducer,
    private readonly helperService: HelperService,
    private readonly invoiceService: InvoiceService,
  ) {}

  async handle(version: number): Promise<void> {
    this.logger.log(`${this.topic}:v${version} is handling...`)

    const nowDate = this.helperService.dateNow()

    await this.scanner.runWithCursor({
      topic: this.topic,
      version: this.version,
      chunking: 100,

      retrieve: async state => {
        return await this.invoiceService.scanEarnPointInvoices(state.lastId, nowDate)
      },

      process: async invoiceIds => {
        await this.producer.publish(EnumInvoiceQueue.PROC_OVER_DUE_INVOICES, {
          version: INVOICE_QUEUE_PROC_VERSION[EnumInvoiceQueue.PROC_OVER_DUE_INVOICES],
          priority: EnumQueuePriority.HIGH,
          startDate: nowDate,
          message: {
            ids: invoiceIds,
          },
        })

        return invoiceIds[invoiceIds.length - 1]
      },
    })
  }
}
