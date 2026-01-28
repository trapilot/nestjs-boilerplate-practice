import { ApiProperty } from '@nestjs/swagger'
import { EnumAuthAbilityAction, EnumAuthAbilityContext, EnumAuthAbilitySubject } from 'app/enums'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'
import { ToArray, ToBoolean, ToNumber, ToObject, ToString } from 'lib/nest-core'
import { RequestSentenceDto } from 'lib/nest-web'

export class PermissionRequestCreateDto {
  @IsOptional()
  @IsEnum(EnumAuthAbilityContext)
  @ToString()
  @ApiProperty({
    required: false,
    enum: EnumAuthAbilityContext,
    enumName: 'EnumAuthAbilityContext',
  })
  context: EnumAuthAbilityContext

  @IsNotEmpty()
  @IsEnum(EnumAuthAbilitySubject)
  @ToString()
  @ApiProperty({ required: true, enum: EnumAuthAbilitySubject, enumName: 'EnumAuthAbilitySubject' })
  subject: EnumAuthAbilitySubject

  @IsNotEmpty()
  @ArrayNotEmpty()
  @IsArray()
  @ToArray({ type: EnumAuthAbilityAction })
  @ApiProperty({
    required: true,
    isArray: true,
    enum: EnumAuthAbilityAction,
    enumName: 'EnumAuthAbilityAction',
  })
  actions: EnumAuthAbilityAction[]

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: '' })
  path: string

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ required: true, type: RequestSentenceDto })
  title: object

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
