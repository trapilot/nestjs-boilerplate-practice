import { ApiProperty } from '@nestjs/swagger'
import { ENUM_MEDIA_TYPE } from '@runtime/prisma-client'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'
import { ToBoolean, ToNumber, ToObject, ToString } from 'lib/nest-core'
import { RequestSentenceDto } from 'lib/nest-web'
import { ENUM_MEDIA_REF_TYPE } from '../enums'

export class MediaRequestCreateDto {
  @IsNotEmpty()
  @IsEnum(ENUM_MEDIA_TYPE)
  @ToString()
  @ApiProperty({ required: true, enum: ENUM_MEDIA_TYPE, example: ENUM_MEDIA_TYPE.BANNER })
  type: ENUM_MEDIA_TYPE

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ required: true, type: RequestSentenceDto })
  title: any

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ required: true, type: RequestSentenceDto })
  brief: any

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 0 })
  sorting: number

  @IsOptional()
  @IsEnum(ENUM_MEDIA_REF_TYPE)
  @ToString()
  @ApiProperty({ required: false, enum: ENUM_MEDIA_REF_TYPE, example: ENUM_MEDIA_REF_TYPE.TEXT })
  refType: string

  @IsOptional()
  @IsString()
  @ToString()
  @ApiProperty({ required: false, example: '' })
  refValue: string

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: true })
  isActive: boolean

  @IsOptional()
  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  url: string
}
