import { Module } from '@nestjs/common'
import { ProductBrandService } from './services'

@Module({
  providers: [ProductBrandService],
  exports: [ProductBrandService],
  imports: [],
})
export class ProductBrandModule {}
