import { Module } from '@nestjs/common'
import { CartModule } from 'modules/cart/cart.module'
import { InvoiceModule } from 'modules/invoice/invoice.module'
import { MemberModule } from 'modules/member/member.module'
import { OrderService } from './services/order.service'

@Module({
  providers: [OrderService],
  exports: [OrderService],
  imports: [CartModule, InvoiceModule, MemberModule],
})
export class OrderModule {}
