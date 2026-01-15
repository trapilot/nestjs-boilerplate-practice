import { Type } from '@nestjs/common'
import { ClassConstructor } from 'class-transformer'
import { EnumLike, IRequestApp } from 'lib/nest-core'
import { IResult } from 'ua-parser-js'
import { AuthJwtAccessPayloadDto } from '../dtos'
import {
  EnumAuthLoginFrom,
  EnumAuthLoginType,
  EnumAuthLoginWith,
  EnumAuthScopeType,
} from '../enums'
import { AuthFactory } from '../helpers'

export interface AuthModuleOptions {
  abilityFactory: Type<AuthFactory>
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
  scopeType: EnumAuthScopeType
  loginType: EnumAuthLoginType
  loginFrom: EnumAuthLoginFrom
  loginWith: EnumAuthLoginWith
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
  types?: EnumAuthLoginType[]
  guards?: ClassConstructor<any>[]
  metadata?: {
    [key: string]: any
  }
}
