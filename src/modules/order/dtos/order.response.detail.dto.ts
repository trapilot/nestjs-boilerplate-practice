import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { EnumOrderSource, EnumOrderStatus } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { EnumDateFormat, ToDate, ToDecimal, ToNumber } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { MemberResponseBelongDto } from 'modules/member/dtos/member.response.detail.dto'
import { ProductResponseBelongDto } from 'modules/product/dtos/product.response.detail.dto'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  code: string

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  memberId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  promotionId: number

  @ApiProperty({ example: '' })
  @Type(() => Number)
  @Expose()
  @ApiProperty({ example: 10 })
  @ToDecimal()
  @Expose()
  totalPrice: number

  @ApiProperty({ example: 10 })
  @ToDecimal()
  @Expose()
  totalPoint: number

  @ApiProperty({ example: '' })
  @Type(() => Number)
  @Expose()
  @ApiProperty({ example: 10 })
  @ToDecimal()
  @Expose()
  discPrice: number

  @ApiProperty({ example: 10 })
  @ToDecimal()
  @Expose()
  discPoint: number

  @ApiProperty({ example: 10 })
  @ToDecimal()
  @Expose()
  finalPrice: number

  @ApiProperty({ example: 10 })
  @ToDecimal()
  @Expose()
  finalPoint: number

  @ApiProperty({ example: EnumOrderSource.SYSTEM })
  @Type(() => String)
  @Expose()
  source: string

  @ApiProperty({ example: EnumOrderStatus.DELIVERED })
  @Type(() => String)
  @Expose()
  status: string

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isBirth: boolean

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate({ format: EnumDateFormat.DATE, ref: 'issuedAt' })
  @Expose()
  issueDate: Date

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

class ResponseDataItemDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  orderId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  productId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  promotionId: number

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @Expose()
  quantity: number

  @ApiProperty({ example: 0 })
  @ToDecimal()
  @Expose()
  unitPrice: number

  @ApiProperty({ example: 0 })
  @ToNumber()
  @Expose()
  unitPoint: number

  @ApiProperty({ example: 0 })
  @ToDecimal()
  @Expose()
  finalPrice: number

  @ApiProperty({ example: 0 })
  @ToNumber()
  @Expose()
  finalPoint: number

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate()
  @Expose()
  expiryDate: Date

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: new Date(Date.now() - 1000 * 3600) })
  @ToDate()
  @Expose()
  updatedAt: Date

  @ApiProperty({ type: () => ProductResponseBelongDto })
  @Type(() => ProductResponseBelongDto)
  @Expose()
  product: ProductResponseBelongDto
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ApiProperty({ type: () => MemberResponseBelongDto })
  @Type(() => MemberResponseBelongDto)
  @Expose()
  member: MemberResponseBelongDto

  @ApiProperty({ type: () => ResponseDataItemDto })
  @Type(() => ResponseDataItemDto)
  @Expose()
  items: ResponseDataItemDto[]
}

export class OrderResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class OrderResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class OrderResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, [
    'id',
    'code',
    'totalPrice',
    'totalPoint',
    'discPrice',
    'discPoint',
    'finalPrice',
    'finalPoint',
  ] as const),
  ResponseDataRelationDto,
) {}
