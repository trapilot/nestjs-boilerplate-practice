import { Type } from '@nestjs/common'
import { ClassConstructor } from 'class-transformer'
import { EnumLike } from 'lib/nest-core'
import { IResult } from 'ua-parser-js'
import { AuthResponseTokenDto } from '../dtos'
import {
  EnumAuthLoginFrom,
  EnumAuthLoginType,
  EnumAuthLoginWith,
  EnumAuthScopeType,
  EnumAuthTwoFactorMethod,
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

export interface IAuthUserData {
  id: number
  [key: string]: any
}

export interface IAuthUserSession {
  scopeType: EnumAuthScopeType
  loginType: EnumAuthLoginType
  loginFrom: EnumAuthLoginFrom
  loginWith: EnumAuthLoginWith
  loginDate?: Date
  loginToken?: string
  loginRotate?: boolean
}

export interface IAuthJwtPayload<T = IAuthUserData> extends Required<IAuthUserSession> {
  // user data
  user: T

  // standard JWT claims
  jti?: string
  iat?: number
  nbf?: number
  exp?: number
  aud?: string
  iss?: string
  sub?: string
}

export interface IAuthLoginOptions {
  userIp: string
  userAgent: IResult
  userToken?: string
  userSession: IAuthUserSession
}

export interface IAuthSignOptions {
  jti: string
  secret: string
  subject: string
  expiresIn: number
}

export interface IAuthVerifyOptions {
  secret: string
  subject: string
}

export interface IAuthTokenGenerate {
  jti: string
  tokens: AuthResponseTokenDto
  loginDate: Date
  loginToken: string
}

export interface IAuthJwtProtectedOptions {
  types?: EnumAuthLoginType[]
  guards?: ClassConstructor<any>[]
  metadata?: {
    [key: string]: any
  }
}

export interface IAuthTwoFactorBackupCodes {
  codes: string[]
  hashes: string[]
}

export interface IAuthTwoFactorBackupCodesVerifyResult {
  isValid: boolean
  index: number
}

export interface IAuthTwoFactorChallenge {
  challengeToken: string
  expiresInMs: number
}

export interface IAuthTwoFactorChallengeCache {
  userId: number
  userSession: IAuthUserSession
}

export interface IAuthTwoFactorVerify {
  method: EnumAuthTwoFactorMethod
  code?: string
  backupCode?: string
}

export interface IAuthTwoFactorVerifyResult {
  isValid: boolean
  method: EnumAuthTwoFactorMethod
  newBackupCodes?: string[]
}

export interface IAuthTwoFactorSetup {
  secret: string
  otpauthUrl: string
  encryptedSecret: string
  iv: string
}

export interface IAuthUserTwoFactor {
  iv: string
  secret: string
  backupCodes: string[]
  attempt: number
}

export interface IAuthUserSessionCache {
  userId: string
  userToken: string
  expiredAt: Date
  jti: string
}
