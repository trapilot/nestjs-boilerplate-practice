import { OmitType } from '@nestjs/swagger'
import { ProductCategoryRequestCreateDto } from './product-category.request.create.dto'

export class ProductCategoryRequestUpdateDto extends OmitType(
  ProductCategoryRequestCreateDto,
  [],
) {}
