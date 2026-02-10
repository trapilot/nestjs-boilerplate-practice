import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { EnumPointAction, EnumPointOrigin, EnumPointReason } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { EnumDateFormat, ToDate, ToDecimal, TransformIf } from 'lib/nest-core'
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

  @ApiProperty({ example: EnumPointOrigin.ADMIN })
  @Type(() => String)
  @Expose()
  origin: string

  @ApiProperty({ example: EnumPointReason.ADJUST })
  @Type(() => String)
  @Expose()
  reason: string

  @ApiProperty({ example: EnumPointAction.PLUS })
  @Type(() => String)
  @Expose()
  action: string

  @ApiProperty({ example: 1000 })
  @ToDecimal()
  @Expose()
  point: number

  @ApiProperty({ example: 1.6 })
  @Type(() => Number)
  @Expose()
  pointBalance: number

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
  @ToDate()
  @Expose()
  createdAt: Date
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
