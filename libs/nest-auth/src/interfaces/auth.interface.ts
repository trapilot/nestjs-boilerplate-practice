import { Type } from '@nestjs/common'
import { ClassConstructor } from 'class-transformer'
import { EnumLike, IRequestApp } from 'lib/nest-core'
import { IResult } from 'ua-parser-js'
import { AuthJwtAccessPayloadDto } from '../dtos'
import {
  ENUM_AUTH_LOGIN_FROM,
  ENUM_AUTH_LOGIN_TYPE,
  ENUM_AUTH_LOGIN_WITH,
  ENUM_AUTH_SCOPE_TYPE,
} from '../enums'
import { AuthFactory } from '../helpers'

export interface AuthModuleOptions {
  factory: Type<AuthFactory>
  subjects: EnumLike | string[]
  actions: EnumLike | string[]
}

export interface IAuthPassword {
  salt: string
  passwordHash: string
  passwordExpired: Date
  passwordCreated: Date
}

export interface IAuthPasswordOptions {
  temporary: boolean
}

export interface IAuthPayloadPermission {
  [subjectIndex: number]: [bitwise: number]
}

export interface IAuthPayloadOptions {
  scopeType: ENUM_AUTH_SCOPE_TYPE
  loginType: ENUM_AUTH_LOGIN_TYPE
  loginFrom: ENUM_AUTH_LOGIN_FROM
  loginWith: ENUM_AUTH_LOGIN_WITH
  loginDate: Date
  loginToken: string
  loginRotate: boolean
}

export interface IAuthRefetchOptions {
  payload: AuthJwtAccessPayloadDto
  userToken?: { refreshToken: string; refreshIn: number }
  userAgent?: IResult
  userRequest?: IRequestApp
}

export interface IAuthJwtProtectedOptions {
  types?: ENUM_AUTH_LOGIN_TYPE[]
  guards?: ClassConstructor<any>[]
  metadata?: {
    [key: string]: any
  }
}
