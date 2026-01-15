import { Module } from '@nestjs/common'
import { OrderModule } from 'modules/order'
import { CartListener } from './listeners'
import { CartService } from './services'

@Module({
  providers: [CartService, CartListener],
  exports: [CartService],
  imports: [OrderModule],
})
export class CartModule {}
