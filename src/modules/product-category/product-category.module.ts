import { Module } from '@nestjs/common'
import { ProductCategoryService } from './services'

@Module({
  providers: [ProductCategoryService],
  exports: [ProductCategoryService],
  imports: [],
})
export class ProductCategoryModule {}
