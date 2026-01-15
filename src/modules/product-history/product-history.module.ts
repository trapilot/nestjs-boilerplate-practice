import { Module } from '@nestjs/common'
import { ProductHistoryService } from './services'

@Module({
  providers: [ProductHistoryService],
  exports: [ProductHistoryService],
  imports: [],
})
export class ProductHistoryModule {}
