import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { EnumTierAction, EnumTierSource } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { EnumDateFormat, ToDate, ToDecimal } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { InvoiceResponseBelongDto } from 'modules/invoice/dtos/invoice.response.detail.dto'
import { MemberResponseBelongDto } from 'modules/member/dtos/member.response.detail.dto'
import { TierResponseBelongDto } from 'modules/tier/dtos/tier.response.detail.dto'

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
  tierId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  invoiceId: number

  @ApiProperty({ example: EnumTierSource.SYSTEM })
  @Type(() => String)
  @Expose()
  source: string

  @ApiProperty({ example: EnumTierAction.IMPORT })
  @Type(() => String)
  @Expose()
  action: string

  @ApiProperty({ example: 20 })
  @ToDecimal()
  @Expose()
  personalAmount: number

  @ApiProperty({ example: 20 })
  @ToDecimal()
  @Expose()
  referralAmount: number

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

export class MemberTierResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class MemberTierResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class MemberTierResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto,
) {}
