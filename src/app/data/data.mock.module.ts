import { Module } from '@nestjs/common'
import { InvoiceModule } from 'modules/invoice'
import { MemberModule } from 'modules/member'
import { ProductModule } from 'modules/product'
import { TierModule } from 'modules/tier'
import { InvoiceMock, MemberMock, ProductMock } from './mocks'

@Module({
  providers: [InvoiceMock, MemberMock, ProductMock],

  imports: [ InvoiceModule, MemberModule, ProductModule, TierModule],
})
export class DataMockModule {}
