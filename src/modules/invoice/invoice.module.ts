import { Module } from '@nestjs/common'
import { InvoiceService } from './services'

@Module({
  providers: [InvoiceService],
  exports: [InvoiceService],
  imports: [],
})
export class InvoiceModule {}
