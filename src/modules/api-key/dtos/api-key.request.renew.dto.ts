import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator'
import { NestHelper, ToDate } from 'lib/nest-core'
import { DateGreaterThanEqual, PropertyGreaterThan } from 'lib/nest-web'

export class ApiKeyRequestRenewDto {
  @IsOptional()
  @IsDate()
  @ToDate({ startOfDay: true })
  @DateGreaterThanEqual(NestHelper.nowDate())
  @ApiProperty({
    description: 'Api Key start date',
    example: faker.date.recent(),
    required: false,
  })
  startDate: Date

  @IsNotEmpty()
  @IsDate()
  @ToDate({ endOfDay: true })
  @PropertyGreaterThan('startDate')
  @ApiProperty({
    description: 'Api Key end date',
    example: faker.date.future(),
    required: false,
  })
  untilDate: Date
}
