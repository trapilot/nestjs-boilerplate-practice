import { ApiProperty } from '@nestjs/swagger'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums/user.enum'
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty } from 'class-validator'
import { ToArray, ToString } from 'lib/nest-core'

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
  @ApiProperty({
    required: true,
    isArray: true,
    enum: EnumAuthAbilityAction,
    enumName: 'EnumAuthAbilityAction',
  })
  actions: EnumAuthAbilityAction[]
}
