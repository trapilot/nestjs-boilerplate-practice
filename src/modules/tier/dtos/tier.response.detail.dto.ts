import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { EnumRateRule, EnumTransitionRule } from '@runtime/prisma-client'
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

class ResponseDataTransitionDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({
    enum: EnumTransitionRule,
    enumName: 'EnumTransitionRule',
    example: EnumTransitionRule.AMOUNT,
  })
  @Type(() => String)
  @Expose()
  rule: EnumTransitionRule

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @Expose()
  value: number

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isEnabled: boolean

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  prevTierId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  nextTierId: number
}

class ResponseDataRateDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  tierId: number

  @ApiProperty({
    enum: EnumRateRule,
    enumName: 'EnumRateRule',
    example: EnumRateRule.PERSONAL,
  })
  @Type(() => String)
  @Expose()
  rule: EnumRateRule

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @Expose()
  value: number
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ApiProperty({ type: () => ResponseDataTransitionDto })
  @Type(() => ResponseDataTransitionDto)
  @Expose()
  transitions: ResponseDataTransitionDto[]

  @ApiProperty({ type: () => ResponseDataRateDto })
  @Type(() => ResponseDataRateDto)
  @Expose()
  rates: ResponseDataRateDto[]
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
