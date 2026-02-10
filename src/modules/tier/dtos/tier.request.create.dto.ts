import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsObject } from 'class-validator'
import { EnumTierCode, ToObject, ToString } from 'lib/nest-core'
import { RequestSentenceDto } from 'lib/nest-web'

export class TierRequestCreateDto {
  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ type: RequestSentenceDto })
  name: object

  @IsNotEmpty()
  @IsEnum(EnumTierCode)
  @ToString()
  @ApiProperty({
    enum: EnumTierCode,
    enumName: 'EnumTierCode',
    example: EnumTierCode.NORMAL,
  })
  code: string

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ type: RequestSentenceDto })
  description: object
}
