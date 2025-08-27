import { InferSubjects, PureAbility } from '@casl/ability'
import { ClassConstructor } from 'class-transformer'
import { IRequestApp } from 'lib/nest-core'
import { IResult } from 'ua-parser-js'
import { AuthJwtAccessPayloadDto } from '../dtos'
import {
  ENUM_AUTH_ABILITY_ACTION,
  ENUM_AUTH_ABILITY_SUBJECT,
  ENUM_AUTH_LOGIN_FROM,
  ENUM_AUTH_LOGIN_TYPE,
  ENUM_AUTH_LOGIN_WITH,
  ENUM_AUTH_SCOPE_TYPE,
} from '../enums'

export interface IAuthPassword {
  salt: string
  passwordHash: string
  passwordExpired: Date
  passwordCreated: Date
}

export interface IAuthPasswordOptions {
  temporary: boolean
}

export interface ITokenPayload {
  expiresIn: number
  tokenType: string
  accessToken: string
  refreshToken: string
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

export interface IAuthAbility {
  subject: ENUM_AUTH_ABILITY_SUBJECT
  actions: ENUM_AUTH_ABILITY_ACTION[]
}

export interface IAuthAbilityFlat {
  subject: ENUM_AUTH_ABILITY_SUBJECT
  action: ENUM_AUTH_ABILITY_ACTION
}

export type IAuthAbilitySubject = InferSubjects<ENUM_AUTH_ABILITY_SUBJECT> | 'all'

export type IAuthAbilityRule = PureAbility<[ENUM_AUTH_ABILITY_ACTION, IAuthAbilitySubject]>

export type IAuthAbilityHandlerCallback = (ability: IAuthAbilityRule) => boolean

export interface IAuthUserTransformer {
  value: any
  key: any
  obj: IAuthUserData
}

export interface IAuthJwtPermission {
  [subjectIndex: number]: [bitwise: number]
}

export interface IAuthUserPermission {
  context: string
  subject: string
  title: any
  sorting: number
  bitwise: number
  isActive: boolean
  isVisible: boolean
}

export interface IAuthUserRole {
  id: number
  level: number
  isActive: boolean
  pivotPermissions: {
    bitwise: number
    permission: IAuthUserPermission
  }[]
}

export interface IAuthUserData {
  level: number
  pivotRoles: {
    role: IAuthUserRole
  }[]
}
