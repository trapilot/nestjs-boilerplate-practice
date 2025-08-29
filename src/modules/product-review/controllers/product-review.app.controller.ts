import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PRODUCT_REVIEW_DOC_OPERATION } from '../constants'
import { ProductReviewService } from '../services'

@ApiTags(PRODUCT_REVIEW_DOC_OPERATION)
@Controller({ version: '1', path: '/product-reviews' })
export class ProductReviewAppController {
  constructor(protected readonly productReviewService: ProductReviewService) {}
}
