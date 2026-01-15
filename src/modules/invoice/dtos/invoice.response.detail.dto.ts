import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { EnumInvoiceStatus } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { EnumDateFormat, ToDate, ToDecimal } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { MemberResponseBelongDto } from 'modules/member'
import { OrderResponseDetailDto } from 'modules/order'

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
  orderId: number

  @ApiProperty({ example: 1 })
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

  @ApiProperty({ example: 10 })
  @ToDecimal()
  @Expose()
  paidPrice: number

  @ApiProperty({ example: 50 })
  @ToDecimal()
  @Expose()
  paidPoint: number

  @ApiProperty({ example: 20 })
  @ToDecimal()
  @Expose()
  finalPrice: number

  @ApiProperty({ example: 20 })
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

  @ApiProperty({ example: new Date(Date.now() + 30000 * 3600) })
  @ToDate({ format: EnumDateFormat.DATE })
  @Expose()
  dueDate: Date

  @ApiProperty({ example: new Date(Date.now() - 10000 * 3600) })
  @ToDate({ format: EnumDateFormat.DATE, ref: 'issuedAt' })
  @Expose()
  issueDate: Date

  @ApiProperty({ example: new Date(Date.now() - 10000 * 3600) })
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
  ResponseDataRelationDto
) {}

export class InvoiceResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto
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
  ResponseDataRelationDto
) {}
