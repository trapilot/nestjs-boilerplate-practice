import { Injectable } from '@nestjs/common'
import { IWorkerHandler, LoggerService } from 'lib/nest-core'
import { INVOICE_QUEUE_PROC_VERSION } from '../constants/invoice.constant'
import { EnumInvoiceQueue } from '../enums/invoice.enum'
import { InvoiceService } from '../services/invoice.service'

@Injectable()
export class InvoiceProcOverDueHandler implements IWorkerHandler {
  topic: string = EnumInvoiceQueue.PROC_OVER_DUE_INVOICES
  version: number = INVOICE_QUEUE_PROC_VERSION[EnumInvoiceQueue.PROC_OVER_DUE_INVOICES]

  constructor(
    private readonly logger: LoggerService,
    private readonly invoiceService: InvoiceService,
  ) {}

  async handle(version: number, payload: { ids: number[] }): Promise<void> {
    this.logger.log(`${this.topic}:v${version} is handling...`)

    for (const invoiceId of payload.ids) {
      await this.invoiceService.processOverDue(invoiceId)
    }
  }
}
