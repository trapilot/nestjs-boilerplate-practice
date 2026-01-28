import { ApiProperty } from '@nestjs/swagger'
import { EnumApiKeyType } from '@runtime/prisma-client'
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { DateUtil, ToDate, ToString } from 'lib/nest-core'
import { DateGreaterThanEqual, PropertyGreaterThan } from 'lib/nest-web'

export class ApiKeyRequestCreateDto {
  @IsNotEmpty()
  @IsEnum(EnumApiKeyType)
  @ApiProperty({
    example: EnumApiKeyType.CLIENT,
    required: true,
    enum: EnumApiKeyType,
    enumName: 'EnumApiKeyType',
  })
  type: EnumApiKeyType

  @IsNotEmpty()
  @IsString()
  @ToString()
  @MaxLength(100)
  @ApiProperty({
    description: 'Api Key name',
    example: 'Payzone',
    required: true,
  })
  name: string

  @IsOptional()
  @IsDate()
  @ToDate({ startOfDay: true })
  @DateGreaterThanEqual(DateUtil.getNow())
  @ApiProperty({
    description: 'Api Key start date',
    example: new Date(Date.now() - 1000 * 3600),
    required: false,
  })
  startDate: Date

  @IsOptional()
  @IsDate()
  @ToDate({ endOfDay: true })
  @PropertyGreaterThan('startDate')
  @ApiProperty({
    description: 'Api Key end date',
    example: new Date(Date.now() + 30000 * 3600),
    required: false,
  })
  untilDate: Date
}
