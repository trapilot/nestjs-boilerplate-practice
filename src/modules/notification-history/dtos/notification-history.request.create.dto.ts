import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { ToNumber } from 'lib/nest-core'

export class NotificationHistoryRequestCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: faker.number.int({ min: 1 }) })
  memberId: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: faker.number.int({ min: 1 }) })
  pushHistoryId: number
}
