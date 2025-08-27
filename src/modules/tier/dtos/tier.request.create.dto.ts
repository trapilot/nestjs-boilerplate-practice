import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber, IsObject } from 'class-validator'
import { ENUM_TIER_CODE, ToNumber, ToObject, ToString } from 'lib/nest-core'
import { RequestSentenceDto } from 'lib/nest-web'

export class TierRequestCreateDto {
  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ type: RequestSentenceDto })
  name: any

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ type: RequestSentenceDto })
  description: any

  @IsNotEmpty()
  @IsEnum(ENUM_TIER_CODE)
  @ToString()
  @ApiProperty({ enum: ENUM_TIER_CODE, example: ENUM_TIER_CODE.NORMAL })
  code: string

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ example: 0 })
  rewardPoint: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ example: 1 })
  birthdayRatio: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ example: 0 })
  limitSpending: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ example: 10_000 })
  initialRate: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ example: 10_000 })
  personalRate: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ example: 10_000 })
  referralRate: number
}
