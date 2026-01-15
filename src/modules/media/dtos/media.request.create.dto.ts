import { ApiProperty } from '@nestjs/swagger'
import { EnumMediaType } from '@runtime/prisma-client'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'
import { EnumMessageRefType, ToBoolean, ToNumber, ToObject, ToString } from 'lib/nest-core'
import { RequestSentenceDto } from 'lib/nest-web'

export class MediaRequestCreateDto {
  @IsNotEmpty()
  @IsEnum(EnumMediaType)
  @ToString()
  @ApiProperty({ required: true, enum: EnumMediaType, example: EnumMediaType.BANNER })
  type: EnumMediaType

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ required: true, type: RequestSentenceDto })
  title: object

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ required: true, type: RequestSentenceDto })
  brief: object

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 0 })
  sorting: number

  @IsOptional()
  @IsEnum(EnumMessageRefType)
  @ToString()
  @ApiProperty({ required: false, enum: EnumMessageRefType, example: EnumMessageRefType.TEXT })
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
