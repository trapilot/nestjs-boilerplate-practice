import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { ENUM_API_KEY_TYPE } from '@prisma/client'
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { DateUtil, ToDate, ToString } from 'lib/nest-core'
import { DateGreaterThanEqual, PropertyGreaterThan } from 'lib/nest-web'

export class ApiKeyRequestCreateDto {
  @IsNotEmpty()
  @IsEnum(ENUM_API_KEY_TYPE)
  @ApiProperty({
    description: 'Api Key name',
    example: ENUM_API_KEY_TYPE.CLIENT,
    required: true,
    enum: ENUM_API_KEY_TYPE,
  })
  type: ENUM_API_KEY_TYPE

  @IsNotEmpty()
  @IsString()
  @ToString()
  @MaxLength(100)
  @ApiProperty({
    description: 'Api Key name',
    example: faker.company.name(),
    required: true,
  })
  name: string

  @IsOptional()
  @IsDate()
  @ToDate({ startOfDay: true })
  @DateGreaterThanEqual(DateUtil.nowDate())
  @ApiProperty({
    description: 'Api Key start date',
    example: faker.date.recent(),
    required: false,
  })
  startDate: Date

  @IsOptional()
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
