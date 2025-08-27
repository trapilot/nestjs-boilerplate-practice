import { OmitType } from '@nestjs/swagger'
import { ProductBrandRequestCreateDto } from './product-brand.request.create.dto'

export class ProductBrandRequestUpdateDto extends OmitType(ProductBrandRequestCreateDto, []) {}
