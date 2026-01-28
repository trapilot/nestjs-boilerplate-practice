import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { EnumPointAction, EnumPointSource } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { EnumDateFormat, ToDate, ToDecimal, TransformIf } from 'lib/nest-core'
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
  tierId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  memberId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  refereeId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  invoiceId: number

  @ApiProperty({ example: 10000 })
  @ToDecimal({ minimumFractionDigits: 2 })
  @Expose()
  invoiceAmount: number

  @ApiProperty({ example: EnumPointSource.SYSTEM })
  @Type(() => String)
  @Expose()
  source: string

  @ApiProperty({ example: EnumPointAction.INITIAL })
  @Type(() => String)
  @Expose()
  action: string

  @ApiProperty({ example: 1000 })
  @ToDecimal()
  @Expose()
  point: number

  @ApiProperty({ example: 20000 })
  @ToDecimal()
  @Expose()
  pointBalance: number

  @ApiProperty({ example: 1.6 })
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

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate({ format: EnumDateFormat.DATE })
  @TransformIf((obj: ResponseDataDetailDto) => obj.point > 0)
  @Expose()
  expiryDate: Date

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate({ format: EnumDateFormat.DATE })
  @Expose()
  releaseDate: Date

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate({ format: EnumDateFormat.DATE, ref: 'createdAt' })
  @Expose()
  createdDate: Date

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
  @ApiProperty({ type: () => TierResponseBelongDto })
  @Type(() => TierResponseBelongDto)
  @Expose()
  tier: TierResponseBelongDto

  @ApiProperty({ type: () => MemberResponseBelongDto })
  @Type(() => MemberResponseBelongDto)
  @Expose()
  member: MemberResponseBelongDto

  @ApiProperty({ type: () => MemberResponseBelongDto })
  @Type(() => MemberResponseBelongDto)
  @Expose()
  referee: MemberResponseBelongDto

  @ApiProperty({ type: () => InvoiceResponseBelongDto })
  @Type(() => InvoiceResponseBelongDto)
  @Expose()
  invoice: InvoiceResponseBelongDto
}

export class MemberPointResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class MemberPointResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class MemberPointResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto,
) {}
