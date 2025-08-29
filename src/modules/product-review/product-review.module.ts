import { Module } from '@nestjs/common'
import { ProductReviewService } from './services'

@Module({
  providers: [ProductReviewService],
  exports: [ProductReviewService],
  imports: [],
})
export class ProductReviewModule {}
