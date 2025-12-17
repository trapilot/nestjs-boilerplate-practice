import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { ENUM_POINT_TYPE } from '@prisma/client'
import { Expose, Type } from 'class-transformer'
import { ENUM_DATE_FORMAT, ToDate, ToDecimal, TransformIf } from 'lib/nest-core'
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
  tierId: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  memberId: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  refereeId: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  invoiceId: number

  @ApiProperty({ example: faker.number.float({ min: 100, max: 10_000, fractionDigits: 0 }) })
  @ToDecimal({ minimumFractionDigits: 2 })
  @Expose()
  invoiceAmount: number

  @ApiProperty({ example: ENUM_POINT_TYPE.PURCHASE })
  @Type(() => String)
  @Expose()
  type: string

  @ApiProperty({ example: faker.number.int({ min: 10, max: 1000 }) })
  @ToDecimal()
  @Expose()
  point: number

  @ApiProperty({ example: faker.number.int({ min: 100, max: 1000 }) })
  @ToDecimal()
  @Expose()
  pointBalance: number

  @ApiProperty({ example: faker.number.float({ min: 0, max: 1 }) })
  @Type(() => Number)
  @Expose()
  multipleRatio: number

  @ApiProperty({ example: false })
  @Type(() => Boolean)
  @Expose()
  isFirst: boolean

  @ApiProperty({ example: false })
  @Type(() => Boolean)
  @Expose()
  isBirth: boolean

  @ApiProperty({ example: false })
  @Type(() => Boolean)
  @Expose()
  isPending: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isActive: boolean

  @ApiProperty({ example: faker.date.past() })
  @ToDate({ format: ENUM_DATE_FORMAT.DATE })
  @TransformIf((obj: ResponseDataDetailDto) => obj.point > 0)
  @Expose()
  expiryDate: Date

  @ApiProperty({ example: faker.date.future() })
  @ToDate({ format: ENUM_DATE_FORMAT.DATE })
  @Expose()
  releaseDate: Date

  @ApiProperty({ example: faker.date.past() })
  @ToDate({ format: ENUM_DATE_FORMAT.DATE, ref: 'createdAt' })
  @Expose()
  createdDate: Date

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
  @ApiProperty({ type: TierResponseBelongDto })
  @Type(() => TierResponseBelongDto)
  @Expose()
  tier: TierResponseBelongDto

  @ApiProperty({ type: MemberResponseBelongDto })
  @Type(() => MemberResponseBelongDto)
  @Expose()
  member: MemberResponseBelongDto

  @ApiProperty({ type: MemberResponseBelongDto })
  @Type(() => MemberResponseBelongDto)
  @Expose()
  referee: MemberResponseBelongDto

  @ApiProperty({ type: InvoiceResponseBelongDto })
  @Type(() => InvoiceResponseBelongDto)
  @Expose()
  invoice: InvoiceResponseBelongDto
}

export class PointHistoryResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class PointHistoryResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class PointHistoryResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto,
) {}
