import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import { ToNumber } from 'lib/nest-core'

export class CartRequestCreateItemDto {
  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 1 })
  productId: number

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: false })
  bundleId: number

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: false })
  offerId: number

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: false })
  promotionId: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 1 })
  quantity: number
}
