import { Module } from '@nestjs/common'
import { CartListener } from './listeners'
import { CartService } from './services'

@Module({
  providers: [CartService, CartListener],
  exports: [CartService],
  imports: [],
})
export class CartModule {}
