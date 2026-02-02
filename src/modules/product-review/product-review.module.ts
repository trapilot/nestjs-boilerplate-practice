import { Module } from '@nestjs/common'
import { ProductReviewService } from './services/product-review.service'

@Module({
  providers: [ProductReviewService],
  exports: [ProductReviewService],
  imports: [],
})
export class ProductReviewModule {}
