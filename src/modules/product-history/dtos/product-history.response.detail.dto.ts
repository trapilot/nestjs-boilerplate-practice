import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { EnumRedemptionSource, EnumRedemptionStatus } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { EnumDateFormat, ToDate, ToDecimal } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { MemberResponseBelongDto } from 'modules/member'
import { OrderResponseBelongDto } from 'modules/order'
import { ProductResponseBelongDto } from 'modules/product'

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
  productId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  orderId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  promotionId: number

  @ApiProperty({ example: 500 })
  @ToDecimal()
  @Expose()
  redeemPrice: number

  @ApiProperty({ example: 100 })
  @ToDecimal()
  @Expose()
  redeemPoint: number

  @ApiProperty({ example: EnumRedemptionSource.ORDER })
  @Type(() => String)
  @Expose()
  source: string

  @ApiProperty({ example: EnumRedemptionStatus.APPROVED })
  @Type(() => String)
  @Expose()
  status: string

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isActive: boolean

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate({ format: EnumDateFormat.DATE })
  @Expose()
  startDate: Date

  @ApiProperty({ example: new Date(Date.now() + 30000 * 3600) })
  @ToDate({ format: EnumDateFormat.DATE })
  @Expose()
  untilDate: Date

  @ApiProperty({ example: new Date(Date.now() + 30000 * 3600) })
  @ToDate({ format: EnumDateFormat.DATE })
  @Expose()
  expiryDate: Date

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate({ format: EnumDateFormat.DATE, ref: 'issuedAt' })
  @Expose()
  issuedDate: Date

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate({ format: EnumDateFormat.DATE, ref: 'usedAt' })
  @Expose()
  usedDate: Date

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate()
  @Expose()
  usedAt: Date

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate()
  @Expose()
  issuedAt: Date

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

  @ApiProperty({ type: () => ProductResponseBelongDto })
  @Type(() => ProductResponseBelongDto)
  @Expose()
  product: ProductResponseBelongDto

  @ApiProperty({ type: () => OrderResponseBelongDto })
  @Type(() => OrderResponseBelongDto)
  @Expose()
  order: OrderResponseBelongDto
}

export class ProductHistoryResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class ProductHistoryResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class ProductHistoryResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto,
) {}
