import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { EnumMemberType } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { EnumAuthLoginFrom } from 'lib/nest-auth'
import { APP_LANGUAGE, EnumDateFormat, ToDate, ToDecimal, ToUrl } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
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

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  code: string

  @ApiProperty({ enum: EnumMemberType, example: EnumMemberType.NORMAL })
  @Type(() => String)
  @Expose()
  type: EnumMemberType

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  cardId: string

  @ApiProperty({ example: 'payx@email.cc.co' })
  @Type(() => String)
  @Expose()
  email: string

  @ApiProperty({ example: 'PayPay' })
  @Type(() => String)
  @Expose()
  name: string

  // @ApiProperty({ example: '852' })
  // @Type(() => String)
  // @Expose()
  // phoneCountry: string

  // @ApiProperty({ example: '987654321' })
  // @Type(() => String)
  // @Expose()
  // phoneNumber: string

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  phone: string

  @ApiProperty({ example: APP_LANGUAGE })
  @Type(() => String)
  @Expose()
  locale: string

  @Type(() => String)
  @ToUrl()
  @Expose()
  avatar: string

  // @ApiProperty({ enum: EnumUserType })
  // @Type(() => String)
  // @Expose()
  // gender: EnumUserType

  @ApiProperty({ example: 'home #01' })
  @Type(() => String)
  @Expose()
  address: string

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  referralCode: string

  @ApiProperty({ example: null })
  @ToDate({ format: EnumDateFormat.DATE })
  @Expose()
  birthDate: Date

  @ApiProperty({ example: null })
  @ToDate({ format: EnumDateFormat.DATE })
  @Expose()
  expiryDate: Date

  @ApiProperty({ example: 0 })
  @ToDecimal()
  @Expose()
  pointBalance: number

  @ApiProperty({ example: 0 })
  @ToDecimal()
  @Expose()
  maximumSpending: number

  @ApiProperty({ example: 0 })
  @ToDecimal()
  @Expose()
  personalSpending: number

  @ApiProperty({ example: 0 })
  @ToDecimal()
  @Expose()
  referralSpending: number

  @Type(() => String)
  @Expose({ groups: [EnumAuthLoginFrom.CMS] })
  deletedReason: string[]

  @Type(() => Boolean)
  @Expose()
  hasFirstPurchased: boolean

  @Type(() => Boolean)
  @Expose()
  hasBirthPurchased: boolean

  @Type(() => Boolean)
  @Expose()
  hasDiamondAchieved: boolean

  @Type(() => Boolean)
  @Expose()
  isEmailVerified: boolean

  @Type(() => Boolean)
  @Expose()
  isPhoneVerified: boolean

  @Type(() => Boolean)
  @Expose()
  isNotifiable: boolean

  @Type(() => Boolean)
  @Expose()
  isPromotable: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose({ groups: [EnumAuthLoginFrom.CMS] })
  isActive: boolean

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @Type(() => Date)
  @Expose({ groups: [EnumAuthLoginFrom.CMS] })
  createdAt: Date

  @ApiProperty({ example: new Date(Date.now() - 1000 * 3600) })
  @Type(() => Date)
  @Expose({ groups: [EnumAuthLoginFrom.CMS] })
  updatedAt: Date
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ApiProperty({ type: () => TierResponseBelongDto })
  @Type(() => TierResponseBelongDto)
  @Expose()
  tier: TierResponseBelongDto
}

export class MemberResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class MemberResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class MemberResponseBelongDto extends PickType(MemberResponseDetailDto, [
  'id',
  'code',
  'name',
  'phone',
  'avatar',
] as const) {}
