import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { EnumTierCode, ToDate, ToLocaleField } from 'lib/nest-core'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: EnumTierCode.NORMAL })
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
  limitAmount: number

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

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: new Date(Date.now() - 1000 * 3600) })
  @ToDate()
  @Expose()
  updatedAt: Date
}

class ResponseDataChartDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  currId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  nextId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  requireAmount: number

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isActive: boolean
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ApiProperty({ type: () => ResponseDataChartDto })
  @Type(() => ResponseDataChartDto)
  @Expose()
  charts: ResponseDataChartDto[]
}

export class TierResponseDetailDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class TierResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [
    'cardCover',
    'cardIcon',
    'cardImage',
    'createdAt',
    'updatedAt',
  ] as const),
  ResponseDataRelationDto,
) {}

export class TierResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id', 'code', 'name'] as const),
  ResponseDataRelationDto,
) {}
