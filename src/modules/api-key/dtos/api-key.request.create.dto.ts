import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { EnumApiKeyType } from '@runtime/prisma-client'
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { DateUtil, ToDate, ToString } from 'lib/nest-core'
import { DateGreaterThanEqual, PropertyGreaterThan } from 'lib/nest-web'

export class ApiKeyRequestCreateDto {
  @IsNotEmpty()
  @IsEnum(EnumApiKeyType)
  @ApiProperty({
    description: 'Api Key name',
    example: EnumApiKeyType.CLIENT,
    required: true,
    enum: EnumApiKeyType,
  })
  type: EnumApiKeyType

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
  @DateGreaterThanEqual(DateUtil.getNow())
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
