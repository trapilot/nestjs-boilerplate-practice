import { OmitType } from '@nestjs/swagger'
import { ProductRequestCreateDto } from './product.request.create.dto'

export class ProductRequestUpdateDto extends OmitType(ProductRequestCreateDto, ['sku'] as const) {}
