import { Module } from '@nestjs/common'
import { CartModule } from 'modules/cart'
import { InvoiceModule } from 'modules/invoice'
import { MemberModule } from 'modules/member'
import { ProductModule } from 'modules/product'
import { TierModule } from 'modules/tier'
import { CartMock, InvoiceMock, MemberMock, ProductMock } from './mocks'

@Module({
  providers: [CartMock, InvoiceMock, MemberMock, ProductMock],

  imports: [CartModule, InvoiceModule, MemberModule, ProductModule, TierModule],
})
export class DataMockModule {}
