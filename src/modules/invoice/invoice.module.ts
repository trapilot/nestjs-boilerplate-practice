import { Module } from '@nestjs/common'
import { InvoiceUtil } from './helpers/invoice.util'
import { InvoiceService } from './services/invoice.service'

@Module({
  providers: [InvoiceService, InvoiceUtil],
  exports: [InvoiceService],
  imports: [],
})
export class InvoiceModule {}
