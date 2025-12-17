import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { ENUM_MEMBER_TIER_ACTION } from '@prisma/client'
import { Expose, Type } from 'class-transformer'
import { ENUM_DATE_FORMAT, ToDate, ToDecimal } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { InvoiceResponseBelongDto } from 'modules/invoice/dtos'
import { MemberResponseBelongDto } from 'modules/member/dtos'
import { TierResponseBelongDto } from 'modules/tier/dtos'

class ResponseDataDetailDto {
  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  memberId: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  invoiceId: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  prevTierId: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  currTierId: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  minTierId: number

  @ApiProperty({ example: ENUM_MEMBER_TIER_ACTION.SYSTEM })
  @Type(() => String)
  @Expose()
  type: string

  @ApiProperty({ example: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }) })
  @ToDecimal()
  @Expose()
  maximumSpending: number

  @ApiProperty({ example: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }) })
  @ToDecimal()
  @Expose()
  personalSpending: number

  @ApiProperty({ example: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }) })
  @ToDecimal()
  @Expose()
  referralSpending: number

  @ApiProperty({ example: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }) })
  @ToDecimal()
  @Expose()
  excessSpending: number

  @ApiProperty({ example: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }) })
  @ToDecimal()
  @Expose()
  renewalSpending: number

  @ApiProperty({ example: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }) })
  @ToDecimal()
  @Expose()
  upgradeSpending: number

  @ApiProperty({ example: faker.date.past() })
  @ToDate({ format: ENUM_DATE_FORMAT.DATE })
  @Expose()
  expiryDate: Date

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isActive: boolean

  @ApiProperty({ example: faker.date.past() })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: faker.date.recent() })
  @ToDate()
  @Expose()
  updatedAt: Date
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ApiProperty({ type: MemberResponseBelongDto })
  @Type(() => MemberResponseBelongDto)
  @Expose()
  member: MemberResponseBelongDto

  @ApiProperty({ type: InvoiceResponseBelongDto })
  @Type(() => InvoiceResponseBelongDto)
  @Expose()
  invoice: InvoiceResponseBelongDto

  @ApiProperty({ type: TierResponseBelongDto })
  @Type(() => TierResponseBelongDto)
  @Expose()
  prevTier: TierResponseBelongDto

  @ApiProperty({ type: TierResponseBelongDto })
  @Type(() => TierResponseBelongDto)
  @Expose()
  currTier: TierResponseBelongDto
}

export class TierHistoryResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class TierHistoryResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class TierHistoryResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto,
) {}
