import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty } from 'class-validator'
import { ToArray, ToString } from 'lib/nest-core'
import { ENUM_APP_ABILITY_ACTION, ENUM_APP_ABILITY_SUBJECT } from 'shared/enums'

export class RolePermissionRequestCreateDto {
  @IsNotEmpty()
  @IsEnum(ENUM_APP_ABILITY_SUBJECT)
  @ToString()
  @ApiProperty({ required: true, enum: ENUM_APP_ABILITY_SUBJECT })
  subject: ENUM_APP_ABILITY_SUBJECT

  @IsNotEmpty()
  @ArrayNotEmpty()
  @IsArray()
  @ToArray()
  @ApiProperty({ required: true, isArray: true, enum: ENUM_APP_ABILITY_ACTION })
  actions: ENUM_APP_ABILITY_ACTION[]
}
