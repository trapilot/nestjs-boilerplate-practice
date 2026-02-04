import { Module } from '@nestjs/common';
import { CartModule } from 'modules/cart/cart.module';
import { InvoiceModule } from 'modules/invoice/invoice.module';
import { MemberModule } from 'modules/member/member.module';
import { OrderModule } from 'modules/order/order.module';
import { ProductModule } from 'modules/product/product.module';
import { TierModule } from 'modules/tier/tier.module';
import { CartCheckoutMock } from './mocks/cart.checkout.mock';
import { CartMock } from './mocks/cart.mock';
import { InvoiceMock } from './mocks/invoice.mock';
import { MemberMock } from './mocks/member.mock';
import { OrderMock } from './mocks/order.mock';
import { ProductMock } from './mocks/product.mock';

@Module({
  providers: [CartMock, CartCheckoutMock, OrderMock, InvoiceMock, MemberMock, ProductMock],
  imports: [CartModule, OrderModule, InvoiceModule, MemberModule, ProductModule, TierModule],
})
export class DataMockModule {}
