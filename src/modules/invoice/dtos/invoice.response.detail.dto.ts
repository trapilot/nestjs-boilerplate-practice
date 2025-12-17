import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { ENUM_INVOICE_STATUS } from '@prisma/client'
import { Expose, Type } from 'class-transformer'
import { ENUM_DATE_FORMAT, ToDate, ToDecimal } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { MemberResponseBelongDto } from 'modules/member/dtos'
import { OrderResponseDetailDto } from 'modules/order/dtos'

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
  orderId: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  promotionId: number

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  invoiceRef: string

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  invoicePath: string

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @ToDecimal()
  @Expose()
  paidPrice: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @ToDecimal()
  @Expose()
  paidPoint: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @ToDecimal()
  @Expose()
  finalPrice: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @ToDecimal()
  @Expose()
  finalPoint: number

  @ApiProperty({ example: ENUM_INVOICE_STATUS.FULLY_PAID })
  @Type(() => String)
  @Expose()
  status: string

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isBirth: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isEarned: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isActive: boolean

  @ApiProperty({ example: faker.date.future() })
  @ToDate({ format: ENUM_DATE_FORMAT.DATE })
  @Expose()
  dueDate: Date

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

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ApiProperty({ type: OrderResponseDetailDto })
  @Type(() => OrderResponseDetailDto)
  @Expose()
  order: OrderResponseDetailDto

  @ApiProperty({ type: MemberResponseBelongDto })
  @Type(() => MemberResponseBelongDto)
  @Expose()
  member: MemberResponseBelongDto
}

export class InvoiceResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class InvoiceResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class InvoiceResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, [
    'id',
    'code',
    'status',
    'issueDate',
    'finalPrice',
    'finalPoint',
  ] as const),
  ResponseDataRelationDto,
) {}
