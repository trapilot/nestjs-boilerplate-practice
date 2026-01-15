import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { EnumInvoiceStatus } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { EnumDateFormat, ToDate, ToDecimal } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { MemberResponseBelongDto } from 'modules/member'
import { OrderResponseDetailDto } from 'modules/order'

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

  @ApiProperty({ example: EnumInvoiceStatus.FULLY_PAID })
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
  @ToDate({ format: EnumDateFormat.DATE })
  @Expose()
  dueDate: Date

  @ApiProperty({ example: faker.date.past() })
  @ToDate({ format: EnumDateFormat.DATE, ref: 'issuedAt' })
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
