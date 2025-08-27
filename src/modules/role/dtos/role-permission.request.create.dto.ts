import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty } from 'class-validator'
import { ENUM_AUTH_ABILITY_ACTION, ENUM_AUTH_ABILITY_SUBJECT } from 'lib/nest-auth'
import { ToArray, ToString } from 'lib/nest-core'

export class RolePermissionRequestCreateDto {
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
}
