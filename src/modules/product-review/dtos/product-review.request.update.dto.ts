import { OmitType } from '@nestjs/swagger'
import { ProductReviewRequestCreateDto } from './product-review.request.create.dto'

export class ProductReviewRequestUpdateDto extends OmitType(ProductReviewRequestCreateDto, []) {}
