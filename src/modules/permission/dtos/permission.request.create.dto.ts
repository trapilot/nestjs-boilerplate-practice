import { ApiProperty } from '@nestjs/swagger'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator'
import { ToArray, ToBoolean, ToNumber, ToObject, ToString } from 'lib/nest-core'
import { RequestSentenceDto } from 'lib/nest-web'
import {
  ENUM_APP_ABILITY_ACTION,
  ENUM_APP_ABILITY_CONTEXT,
  ENUM_APP_ABILITY_SUBJECT,
} from 'shared/enums'

export class PermissionRequestCreateDto {
  @IsOptional()
  @IsEnum(ENUM_APP_ABILITY_CONTEXT)
  @ToString()
  @ApiProperty({ required: false, enum: ENUM_APP_ABILITY_CONTEXT })
  context: ENUM_APP_ABILITY_CONTEXT

  @IsNotEmpty()
  @IsEnum(ENUM_APP_ABILITY_SUBJECT)
  @ToString()
  @ApiProperty({ required: true, enum: ENUM_APP_ABILITY_SUBJECT })
  subject: ENUM_APP_ABILITY_SUBJECT

  @IsNotEmpty()
  @ArrayNotEmpty()
  @IsArray()
  @ToArray({ type: ENUM_APP_ABILITY_ACTION })
  @ApiProperty({ required: true, isArray: true, enum: ENUM_APP_ABILITY_ACTION })
  actions: ENUM_APP_ABILITY_ACTION[]

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ required: true, type: RequestSentenceDto })
  title: any

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 0 })
  sorting: number

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: true, example: true })
  isVisible: boolean

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: true, example: true })
  isActive: boolean
}
