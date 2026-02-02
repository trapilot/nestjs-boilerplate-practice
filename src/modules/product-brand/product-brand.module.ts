import { Module } from '@nestjs/common'
import { ProductBrandService } from './services/product-brand.service'

@Module({
  providers: [ProductBrandService],
  exports: [ProductBrandService],
  imports: [],
})
export class ProductBrandModule {}
