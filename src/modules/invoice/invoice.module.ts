import { Module } from '@nestjs/common'
import { InvoiceUtil } from './helpers/invoice.util'
import { InvoiceScheduler } from './schedulers/invoice.scheduler'
import { InvoiceService } from './services/invoice.service'

@Module({
  providers: [InvoiceService, InvoiceUtil, InvoiceScheduler],
  exports: [InvoiceService],
  imports: [],
})
export class InvoiceModule {}
