import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { EnumTierHistoryMethod } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { EnumDateFormat, ToDate, ToDecimal } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { InvoiceResponseBelongDto } from 'modules/invoice'
import { MemberResponseBelongDto } from 'modules/member'
import { TierResponseBelongDto } from 'modules/tier'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  memberId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  invoiceId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  prevTierId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  currTierId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  minTierId: number

  @ApiProperty({ example: EnumTierHistoryMethod.INITIAL })
  @Type(() => String)
  @Expose()
  type: string

  @ApiProperty({ example: 20 })
  @ToDecimal()
  @Expose()
  maximumSpending: number

  @ApiProperty({ example: 20 })
  @ToDecimal()
  @Expose()
  personalSpending: number

  @ApiProperty({ example: 20 })
  @ToDecimal()
  @Expose()
  referralSpending: number

  @ApiProperty({ example: 20 })
  @ToDecimal()
  @Expose()
  excessSpending: number

  @ApiProperty({ example: 20 })
  @ToDecimal()
  @Expose()
  renewalSpending: number

  @ApiProperty({ example: 20 })
  @ToDecimal()
  @Expose()
  upgradeSpending: number

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate({ format: EnumDateFormat.DATE })
  @Expose()
  expiryDate: Date

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isActive: boolean

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: new Date(Date.now() - 1000 * 3600) })
  @ToDate()
  @Expose()
  updatedAt: Date
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ApiProperty({ type: () => MemberResponseBelongDto })
  @Type(() => MemberResponseBelongDto)
  @Expose()
  member: MemberResponseBelongDto

  @ApiProperty({ type: () => InvoiceResponseBelongDto })
  @Type(() => InvoiceResponseBelongDto)
  @Expose()
  invoice: InvoiceResponseBelongDto

  @ApiProperty({ type: () => TierResponseBelongDto })
  @Type(() => TierResponseBelongDto)
  @Expose()
  prevTier: TierResponseBelongDto

  @ApiProperty({ type: () => TierResponseBelongDto })
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
