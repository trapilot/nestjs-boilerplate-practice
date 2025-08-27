import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { ToNumber } from 'lib/nest-core'

export class ProductHistoryRequestCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: faker.number.int({ min: 1, max: 10 }) })
  memberId: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: faker.number.int({ min: 1, max: 10 }) })
  productId: number
}
