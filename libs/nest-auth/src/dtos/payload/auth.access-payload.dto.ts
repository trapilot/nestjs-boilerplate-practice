import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import {
  ENUM_AUTH_LOGIN_FROM,
  ENUM_AUTH_LOGIN_TYPE,
  ENUM_AUTH_LOGIN_WITH,
  ENUM_AUTH_SCOPE_TYPE,
} from '../../enums'

export class AuthJwtAccessPayloadDto<T = Record<string, any>> {
  @ApiProperty({
    required: true,
    nullable: false,
  })
  user: T

  @ApiProperty({
    required: true,
    nullable: false,
    enum: ENUM_AUTH_SCOPE_TYPE,
  })
  scopeType: ENUM_AUTH_SCOPE_TYPE

  @ApiProperty({
    required: true,
    nullable: false,
    enum: ENUM_AUTH_LOGIN_TYPE,
  })
  loginType: ENUM_AUTH_LOGIN_TYPE

  @ApiProperty({
    required: true,
    nullable: false,
    enum: ENUM_AUTH_LOGIN_FROM,
  })
  loginFrom: ENUM_AUTH_LOGIN_FROM

  @ApiProperty({
    required: true,
    nullable: false,
    enum: ENUM_AUTH_LOGIN_WITH,
  })
  loginWith: ENUM_AUTH_LOGIN_WITH

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
