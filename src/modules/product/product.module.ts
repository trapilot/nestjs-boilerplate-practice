import { Module } from '@nestjs/common'
import { ProductService } from './services'

@Module({
  providers: [ProductService],
  exports: [ProductService],
  imports: [],
})
export class ProductModule {}
