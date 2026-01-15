import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
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
    example: faker.date.recent(),
  })
  loginDate: Date

  @ApiProperty({
    required: true,
    nullable: false,
    example: faker.string.alphanumeric(10),
  })
  loginToken: string

  @ApiProperty({
    required: true,
    nullable: false,
    example: faker.datatype.boolean(),
  })
  loginRotate: boolean
}
