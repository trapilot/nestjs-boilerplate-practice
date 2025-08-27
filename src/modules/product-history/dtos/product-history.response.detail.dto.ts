import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { ENUM_REDEMPTION_SOURCE, ENUM_REDEMPTION_STATUS } from '@prisma/client'
import { Expose, Type } from 'class-transformer'
import { ENUM_DATE_FORMAT, ToDate, ToDecimal } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { MemberResponseBelongDto } from 'src/modules/member/dtos'
import { OrderResponseBelongDto } from 'src/modules/order/dtos'
import { ProductResponseBelongDto } from 'src/modules/product/dtos'

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
  productId: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  orderId: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  promotionId: number

  @ApiProperty({ example: faker.number.float({ min: 100, max: 1_000 }) })
  @ToDecimal()
  @Expose()
  redeemPrice: number

  @ApiProperty({ example: faker.number.int({ min: 10, max: 100 }) })
  @ToDecimal()
  @Expose()
  redeemPoint: number

  @ApiProperty({ example: ENUM_REDEMPTION_SOURCE.ORDER })
  @Type(() => String)
  @Expose()
  source: string

  @ApiProperty({ example: ENUM_REDEMPTION_STATUS.APPROVED })
  @Type(() => String)
  @Expose()
  status: string

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isActive: boolean

  @ApiProperty({ example: faker.date.past() })
  @ToDate({ format: ENUM_DATE_FORMAT.DATE })
  @Expose()
  startDate: Date

  @ApiProperty({ example: faker.date.future() })
  @ToDate({ format: ENUM_DATE_FORMAT.DATE })
  @Expose()
  untilDate: Date

  @ApiProperty({ example: faker.date.future() })
  @ToDate({ format: ENUM_DATE_FORMAT.DATE })
  @Expose()
  expiryDate: Date

  @ApiProperty({ example: faker.date.past() })
  @ToDate({ format: ENUM_DATE_FORMAT.DATE, ref: 'issuedAt' })
  @Expose()
  issuedDate: Date

  @ApiProperty({ example: faker.date.past() })
  @ToDate({ format: ENUM_DATE_FORMAT.DATE, ref: 'usedAt' })
  @Expose()
  usedDate: Date

  @ApiProperty({ example: faker.date.past() })
  @ToDate()
  @Expose()
  usedAt: Date

  @ApiProperty({ example: faker.date.past() })
  @ToDate()
  @Expose()
  issuedAt: Date

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

  @ApiProperty({ type: ProductResponseBelongDto })
  @Type(() => ProductResponseBelongDto)
  @Expose()
  product: ProductResponseBelongDto

  @ApiProperty({ type: OrderResponseBelongDto })
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
