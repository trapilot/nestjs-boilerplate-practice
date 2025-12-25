import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { ToNumber } from 'lib/nest-core'

export class InvoiceRequestCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 1 })
  memberId: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 1 })
  orderId: number
}
