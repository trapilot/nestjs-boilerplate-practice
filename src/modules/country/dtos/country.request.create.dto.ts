import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'
import { ToBoolean, ToObject, ToString } from 'lib/nest-core'
import { RequestSentenceDto } from 'lib/nest-web'

export class CountryRequestCreateDto {
  @IsOptional()
  @IsString()
  @ToString()
  @ApiProperty({ required: false })
  flag: string

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ type: RequestSentenceDto })
  name: any

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: true, example: true })
  isActive: boolean
}
