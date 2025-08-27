import { OmitType } from '@nestjs/swagger'
import { CartRequestCreateDto } from './cart.request.create.dto'

export class CartRequestUpdateDto extends OmitType(CartRequestCreateDto, []) {}
