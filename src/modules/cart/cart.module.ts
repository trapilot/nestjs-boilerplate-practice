import { Module } from '@nestjs/common'
import { ProductModule } from 'modules/product/product.module'
import { CartService } from './services/cart.service'

@Module({
  providers: [CartService],
  exports: [CartService],
  imports: [ProductModule],
})
export class CartModule {}
