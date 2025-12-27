import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { ENUM_MEMBER_TYPE } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { ENUM_AUTH_LOGIN_FROM } from 'lib/nest-auth'
import { APP_LANGUAGE, ENUM_DATE_FORMAT, ToDate, ToDecimal, ToUrl } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { TierResponseBelongDto } from 'modules/tier/dtos'

class ResponseDataDetailDto {
  @ApiProperty({ example: faker.number.int({ min: 1, max: 100 }) })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 2 }) })
  @Type(() => Number)
  @Expose()
  tierId: number

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  code: string

  @ApiProperty({ enum: ENUM_MEMBER_TYPE, example: ENUM_MEMBER_TYPE.NORMAL })
  @Type(() => String)
  @Expose()
  type: ENUM_MEMBER_TYPE

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  cardId: string

  @ApiProperty({ example: faker.internet.email() })
  @Type(() => String)
  @Expose()
  email: string

  @ApiProperty({ example: faker.person.lastName() })
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

  // @ApiProperty({ enum: ENUM_GENDER_TYPE })
  // @Type(() => String)
  // @Expose()
  // gender: ENUM_GENDER_TYPE

  @ApiProperty({ example: faker.location.streetAddress(false) })
  @Type(() => String)
  @Expose()
  address: string

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  referralCode: string

  @ApiProperty({ example: null })
  @ToDate({ format: ENUM_DATE_FORMAT.DATE })
  @Expose()
  birthDate: Date

  @ApiProperty({ example: null })
  @ToDate({ format: ENUM_DATE_FORMAT.DATE })
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
  @Expose({ groups: [ENUM_AUTH_LOGIN_FROM.CMS] })
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
  @Expose({ groups: [ENUM_AUTH_LOGIN_FROM.CMS] })
  isActive: boolean

  @ApiProperty({ example: faker.date.recent() })
  @Type(() => Date)
  @Expose({ groups: [ENUM_AUTH_LOGIN_FROM.CMS] })
  createdAt: Date

  @ApiProperty({ example: faker.date.soon() })
  @Type(() => Date)
  @Expose({ groups: [ENUM_AUTH_LOGIN_FROM.CMS] })
  updatedAt: Date
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ApiProperty({ type: TierResponseBelongDto })
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
