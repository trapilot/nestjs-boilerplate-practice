import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsObject, IsOptional } from 'class-validator'
import { ToObject, ToString } from 'lib/nest-core'
import { RequestSentenceDto } from 'lib/nest-web'
import { EnumFactType } from '../enums'

export class FactRequestCreateDto {
  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ required: true, type: RequestSentenceDto })
  title: object

  @IsOptional()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ required: true, type: RequestSentenceDto })
  content: object

  @IsNotEmpty()
  @IsEnum(EnumFactType)
  @ToString()
  @ApiProperty({ required: true, enum: EnumFactType })
  type: EnumFactType

  @IsOptional()
  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  thumbnail?: string
}
