import { Module } from '@nestjs/common'
import { OrderService } from './services'

@Module({
  providers: [OrderService],
  exports: [OrderService],
  imports: [],
})
export class OrderModule {}
