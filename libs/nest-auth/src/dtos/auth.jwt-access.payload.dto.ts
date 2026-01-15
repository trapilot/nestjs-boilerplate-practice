import { ApiProperty } from '@nestjs/swagger'
import { APP_START } from 'lib/nest-core'
import {
  EnumAuthLoginFrom,
  EnumAuthLoginType,
  EnumAuthLoginWith,
  EnumAuthScopeType,
} from '../enums'

export class AuthJwtAccessPayloadDto<T = Record<string, any>> {
  @ApiProperty({
    required: true,
    nullable: false,
  })
  user: T

  @ApiProperty({
    required: true,
    nullable: false,
    enum: EnumAuthScopeType,
  })
  scopeType: EnumAuthScopeType

  @ApiProperty({
    required: true,
    nullable: false,
    enum: EnumAuthLoginType,
  })
  loginType: EnumAuthLoginType

  @ApiProperty({
    required: true,
    nullable: false,
    enum: EnumAuthLoginFrom,
  })
  loginFrom: EnumAuthLoginFrom

  @ApiProperty({
    required: true,
    nullable: false,
    enum: EnumAuthLoginWith,
  })
  loginWith: EnumAuthLoginWith

  @ApiProperty({
    required: true,
    nullable: false,
    example: APP_START,
  })
  loginDate: Date

  @ApiProperty({
    required: true,
    nullable: false,
    example: 'asjdgh124123jl213aazs',
  })
  loginToken: string

  @ApiProperty({
    required: true,
    nullable: false,
    example: false,
  })
  loginRotate: boolean
}
