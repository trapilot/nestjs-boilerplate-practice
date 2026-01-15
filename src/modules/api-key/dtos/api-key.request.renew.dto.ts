import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator'
import { DateUtil, ToDate } from 'lib/nest-core'
import { DateGreaterThanEqual, PropertyGreaterThan } from 'lib/nest-web'

export class ApiKeyRequestRenewDto {
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

  @IsNotEmpty()
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
