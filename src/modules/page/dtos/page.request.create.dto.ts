import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsObject, IsOptional } from 'class-validator'
import { ToObject, ToString } from 'lib/nest-core'
import { RequestSentenceDto } from 'lib/nest-web'
import { EnumPageType } from '../enums/page.enum'

export class PageRequestCreateDto {
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
  @IsEnum(EnumPageType)
  @ToString()
  @ApiProperty({ required: true, enum: EnumPageType, enumName: 'EnumPageType' })
  type: EnumPageType

  @IsOptional()
  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  thumbnail?: string
}
