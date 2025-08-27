import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ORDER_DOC_OPERATION } from '../constants'
import { OrderService } from '../services'

@ApiTags(ORDER_DOC_OPERATION)
@Controller({ version: '1', path: '/orders' })
export class OrderAppController {
  constructor(protected readonly orderService: OrderService) {}
}
