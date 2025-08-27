import { OmitType } from '@nestjs/swagger'
import { OrderRequestCreateDto } from './order.request.create.dto'

export class OrderRequestUpdateDto extends OmitType(OrderRequestCreateDto, []) {}
