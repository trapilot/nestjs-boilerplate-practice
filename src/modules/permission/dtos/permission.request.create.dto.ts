import { ApiProperty } from '@nestjs/swagger'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'
import {
  ENUM_AUTH_ABILITY_ACTION,
  ENUM_AUTH_ABILITY_CONTEXT,
  ENUM_AUTH_ABILITY_SUBJECT,
} from 'lib/nest-auth'
import { ToArray, ToBoolean, ToNumber, ToString } from 'lib/nest-core'

export class PermissionRequestCreateDto {
  @IsOptional()
  @IsEnum(ENUM_AUTH_ABILITY_CONTEXT)
  @ToString()
  @ApiProperty({ required: false, enum: ENUM_AUTH_ABILITY_CONTEXT })
  context: ENUM_AUTH_ABILITY_CONTEXT

  @IsNotEmpty()
  @IsEnum(ENUM_AUTH_ABILITY_SUBJECT)
  @ToString()
  @ApiProperty({ required: true, enum: ENUM_AUTH_ABILITY_SUBJECT })
  subject: ENUM_AUTH_ABILITY_SUBJECT

  @IsNotEmpty()
  @ArrayNotEmpty()
  @IsArray()
  @ToArray()
  @ApiProperty({ required: true, isArray: true, enum: ENUM_AUTH_ABILITY_ACTION })
  actions: ENUM_AUTH_ABILITY_ACTION[]

  @IsNotEmpty()
  @IsString()
  @ToString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({ required: true, example: 'ADMIN' })
  title: string

  @IsOptional()
  @IsString()
  @ToString()
  @ApiProperty({ required: false, example: '' })
  description?: string | null

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
