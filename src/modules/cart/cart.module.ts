import { Module } from '@nestjs/common'
import { CartListener } from './listeners'
import { CartService } from './services'

@Module({
  providers: [CartListener, CartService],
  exports: [CartService],
  imports: [],
})
export class CartModule {}
