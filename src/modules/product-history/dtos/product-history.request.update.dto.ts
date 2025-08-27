import { OmitType } from '@nestjs/swagger'
import { ProductHistoryRequestCreateDto } from './product-history.request.create.dto'

export class ProductHistoryRequestUpdateDto extends OmitType(ProductHistoryRequestCreateDto, []) {}
