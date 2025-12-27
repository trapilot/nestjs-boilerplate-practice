import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { ENUM_ORDER_SOURCE, ENUM_ORDER_STATUS } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { ENUM_DATE_FORMAT, ToDate, ToDecimal, ToNumber } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { MemberResponseBelongDto } from 'modules/member/dtos'
import { ProductResponseBelongDto } from 'modules/product/dtos'

class ResponseDataDetailDto {
  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  code: string

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  memberId: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  promotionId: number

  @ApiProperty({ example: '' })
  @Type(() => Number)
  @Expose()
  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @ToDecimal()
  @Expose()
  totalPrice: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @ToDecimal()
  @Expose()
  totalPoint: number

  @ApiProperty({ example: '' })
  @Type(() => Number)
  @Expose()
  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @ToDecimal()
  @Expose()
  discPrice: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @ToDecimal()
  @Expose()
  discPoint: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @ToDecimal()
  @Expose()
  finalPrice: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @ToDecimal()
  @Expose()
  finalPoint: number

  @ApiProperty({ example: ENUM_ORDER_SOURCE.SYSTEM })
  @Type(() => String)
  @Expose()
  source: string

  @ApiProperty({ example: ENUM_ORDER_STATUS.DELIVERED })
  @Type(() => String)
  @Expose()
  status: string

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isBirth: boolean

  @ApiProperty({ example: faker.date.past() })
  @ToDate({ format: ENUM_DATE_FORMAT.DATE, ref: 'issuedAt' })
  @Expose()
  issueDate: Date

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

class ResponseDataItemDto {
  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  orderId: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  productId: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
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

  @ApiProperty({ example: faker.date.past() })
  @ToDate()
  @Expose()
  expiryDate: Date

  @ApiProperty({ example: faker.date.past() })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: faker.date.recent() })
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

  @ApiProperty({ type: () => [ResponseDataItemDto] })
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
