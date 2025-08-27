import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ENUM_TIER_CODE, ToDate, ToLocaleField } from 'lib/nest-core'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'

class ResponseDataDetailDto {
  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: ENUM_TIER_CODE.NORMAL })
  @Type(() => String)
  @Expose()
  code: string

  @ApiProperty({ type: ResponseLocaleDto })
  @Type(() => ResponseLocaleDto)
  @Expose()
  name: ResponseLocaleDto

  @ApiProperty({ type: [ResponseLocaleDto] })
  @ToLocaleField({ type: ResponseLocaleDto })
  @Expose()
  description: ResponseLocaleDto

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @Expose()
  rewardPoint: number

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @Expose()
  limitSpending: number

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @Expose()
  personalRate: number

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @Expose()
  referralRate: number

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @Expose()
  initialRate: number

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @Expose()
  birthdayRatio: number

  @ApiProperty({ example: null })
  @Type(() => String)
  @Expose()
  cardIcon: string

  @ApiProperty({ example: null })
  @Type(() => String)
  @Expose()
  cardImage: string

  @ApiProperty({ example: null })
  @Type(() => String)
  @Expose()
  cardCover: string

  @ApiProperty({ example: faker.date.past() })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: faker.date.recent() })
  @ToDate()
  @Expose()
  updatedAt: Date
}

class ResponseDataChartDto {
  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  currId: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  nextId: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  requireSpending: number

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isActive: boolean
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ApiProperty({ type: [ResponseDataChartDto] })
  @Type(() => ResponseDataChartDto)
  @Expose()
  charts: ResponseDataChartDto[]
}

export class TierResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class TierResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class TierResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id', 'code', 'name'] as const),
  ResponseDataRelationDto,
) {}
