import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty } from 'class-validator'
import { ToArray, ToString } from 'lib/nest-core'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'shared/enums'

export class RolePermissionRequestCreateDto {
  @IsNotEmpty()
  @IsEnum(EnumAuthAbilitySubject)
  @ToString()
  @ApiProperty({ required: true, enum: EnumAuthAbilitySubject })
  subject: EnumAuthAbilitySubject

  @IsNotEmpty()
  @ArrayNotEmpty()
  @IsArray()
  @ToArray()
  @ApiProperty({ required: true, isArray: true, enum: EnumAuthAbilityAction })
  actions: EnumAuthAbilityAction[]
}
