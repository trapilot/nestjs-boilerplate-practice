import { Module } from '@nestjs/common'
import { OrderUtil } from './helpers'
import { OrderService } from './services'

@Module({
  providers: [OrderService, OrderUtil],
  exports: [OrderService, OrderUtil],
  imports: [],
})
export class OrderModule {}
