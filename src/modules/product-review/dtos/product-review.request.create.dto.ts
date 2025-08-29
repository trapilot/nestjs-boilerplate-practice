import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { ToNumber, ToString } from 'lib/nest-core'

export class ProductReviewRequestCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 1 })
  productId: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 1 })
  memberId: number

  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: '' })
  comment: string
}
