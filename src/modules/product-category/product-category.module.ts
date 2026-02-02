import { Module } from '@nestjs/common'
import { ProductCategoryService } from './services/product-category.service'

@Module({
  providers: [ProductCategoryService],
  exports: [ProductCategoryService],
  imports: [],
})
export class ProductCategoryModule {}
