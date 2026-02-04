import { Module } from '@nestjs/common'
import { MemberModule } from 'modules/member/member.module'
import { ProductModule } from 'modules/product/product.module'
import { CartService } from './services/cart.service'

@Module({
  providers: [CartService],
  exports: [CartService],
  imports: [ProductModule, MemberModule],
})
export class CartModule {}
