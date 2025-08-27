import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsObject, IsOptional } from 'class-validator'
import { ToObject, ToString } from 'lib/nest-core'
import { RequestSentenceDto } from 'lib/nest-web'
import { ENUM_FACT_TYPE } from '../enums'

export class FactRequestCreateDto {
  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ required: true, type: RequestSentenceDto })
  title: any

  @IsOptional()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ required: true, type: RequestSentenceDto })
  content: any

  @IsNotEmpty()
  @IsEnum(ENUM_FACT_TYPE)
  @ToString()
  @ApiProperty({ required: true, enum: ENUM_FACT_TYPE })
  type: ENUM_FACT_TYPE

  @IsOptional()
  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  thumbnail?: string
}
