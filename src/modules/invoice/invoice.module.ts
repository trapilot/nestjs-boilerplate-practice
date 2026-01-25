import { Module } from '@nestjs/common'
import { InvoiceService } from './services'
import { InvoiceUtil } from './helpers'

@Module({
  providers: [InvoiceService, InvoiceUtil],
  exports: [InvoiceService, InvoiceUtil],
  imports: [],
})
export class InvoiceModule {}
