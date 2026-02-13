import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { OAuth2Client, TokenInfo } from 'google-auth-library'
import { CacheService, HelperService, IStringRandomOptions } from 'lib/nest-core'
import { IResult } from 'ua-parser-js'
import verifyAppleToken from 'verify-apple-id-token'
import {
  AuthResponseTokenDto,
  AuthSocialApplePayloadDto,
  AuthSocialGooglePayloadDto,
} from '../dtos'
import { EnumAuthScopeType } from '../enums'
import {
  IAuthJwtPayload,
  IAuthPassword,
  IAuthPasswordOptions,
  IAuthSignOptions,
  IAuthTokenGenerate,
  IAuthUserData,
  IAuthUserSession,
  IAuthUserSessionCache,
  IAuthVerifyOptions,
} from '../interfaces'

@Injectable()
export class AuthUtil {
  // jwt
  private readonly jwtAccessTokenSecretKey: string
  private readonly jwtAccessTokenExpirationTime: number

  private readonly jwtRefreshTokenSecretKey: string
  private readonly jwtRefreshTokenExpirationTime: number

  private readonly jwtPrefix: string
  private readonly jwtAudience: string
  private readonly jwtIssuer: string

  // password
  private readonly passwordExpiredIn: number
  private readonly passwordExpiredTemporary: number
  private readonly passwordSaltLength: number

  private readonly passwordAttempt: boolean
  private readonly passwordMaxAttempt: number

  // apple
  private readonly appleClientId: string
  private readonly appleSignInClientId: string

  // google
  private readonly googleClient: OAuth2Client

  private readonly keyPattern: string = 'online:{userScope}:{userId}:{userToken}'

  constructor(
    private readonly cache: CacheService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly helperService: HelperService,
  ) {
    // jwt
    this.jwtAccessTokenSecretKey = this.config.get<string>('auth.jwt.accessToken.secretKey')
    this.jwtAccessTokenExpirationTime = this.config.get<number>(
      'auth.jwt.accessToken.expirationTime',
    )

    this.jwtRefreshTokenSecretKey = this.config.get<string>('auth.jwt.refreshToken.secretKey')
    this.jwtRefreshTokenExpirationTime = this.config.get<number>(
      'auth.jwt.refreshToken.expirationTime',
    )

    this.jwtPrefix = this.config.get<string>('auth.jwt.prefix')
    this.jwtAudience = this.config.get<string>('auth.jwt.audience')
    this.jwtIssuer = this.config.get<string>('auth.jwt.issuer')

    // password
    this.passwordExpiredIn = this.config.get<number>('auth.password.expiredIn')
    this.passwordExpiredTemporary = this.config.get<number>('auth.password.expiredInTemporary')
    this.passwordSaltLength = this.config.get<number>('auth.password.saltLength')

    this.passwordAttempt = this.config.get<boolean>('auth.password.attempt')
    this.passwordMaxAttempt = this.config.get<number>('auth.password.maxAttempt')

    // apple
    this.appleClientId = this.config.get<string>('auth.apple.clientId')
    this.appleSignInClientId = this.config.get<string>('auth.apple.signInClientId')

    // google
    this.googleClient = new OAuth2Client(
      this.config.get<string>('auth.google.clientId'),
      this.config.get<string>('auth.google.clientSecret'),
    )
  }

  payloadToken<T>(token: string): Required<IAuthJwtPayload<T>> {
    return this.jwtService.decode<Required<IAuthJwtPayload<T>>>(token)
  }

  createToken(payload: IAuthJwtPayload, options: IAuthSignOptions): string {
    return this.jwtService.sign(payload, {
      issuer: this.jwtIssuer,
      audience: this.jwtAudience,
      secret: options.secret,
      subject: options.subject,
      expiresIn: options.expiresIn,
      jwtid: options.jti,
    })
  }

  validateToken(token: string, options: IAuthVerifyOptions): boolean {
    try {
      this.jwtService.verify(token, {
        issuer: this.jwtIssuer,
        audience: this.jwtAudience,
        secret: options.secret,
        subject: options.subject,
        ignoreExpiration: false,
      })

      return true
    } catch {
      return false
    }
  }

  generateJti(): string {
    return this.helperService.randomString(32)
  }

  createSession(userData: IAuthUserData, options: IAuthUserSession): IAuthTokenGenerate {
    const jti = this.generateJti()
    const subject = `${userData.id}`

    const payloadOptions: Required<IAuthUserSession> = {
      scopeType: options.scopeType,
      loginType: options.loginType,
      loginFrom: options.loginFrom,
      loginWith: options.loginWith,
      loginDate: options?.loginDate ?? this.helperService.dateNow(),
      loginToken: options?.loginToken ?? this.helperService.createId(),
      loginRotate: !!options?.loginRotate,
    }

    const payloadAccessToken = this.createPayload(userData, payloadOptions)
    const payloadRefreshToken = this.createPayload({ id: userData.id }, payloadOptions)

    const [accessIn, refreshIn] = !!options.loginRotate
      ? [this.getAccessTokenExpirationTime(), this.getRefreshTokenExpirationTime()]
      : [this.getRemainingExpirationTime(), 0]

    const accessToken = this.createToken(payloadAccessToken, {
      jti,
      subject,
      expiresIn: accessIn,
      secret: this.jwtAccessTokenSecretKey,
    })

    const refreshToken = this.createToken(payloadRefreshToken, {
      jti,
      subject,
      expiresIn: refreshIn,
      secret: this.jwtRefreshTokenSecretKey,
    })

    const tokens: AuthResponseTokenDto = {
      tokenType: this.jwtPrefix,
      expiresIn: accessIn,
      refreshIn,
      accessToken,
      refreshToken,
    }

    return {
      jti,
      tokens,
      loginDate: payloadOptions.loginDate,
      loginToken: payloadOptions.loginToken,
    }
  }

  createPayload(
    data: IAuthUserData,
    options: Required<IAuthUserSession>,
  ): IAuthJwtPayload<IAuthUserData> {
    return {
      user: data,
      scopeType: options.scopeType,
      loginType: options.loginType,
      loginFrom: options.loginFrom,
      loginWith: options.loginWith,
      loginDate: options.loginDate,
      loginToken: options.loginToken,
      loginRotate: options.loginRotate,
    }
  }

  createSalt(length: number): string {
    return this.helperService.randomSalt(length)
  }

  async passwordVerify(passwordRaw: string, passwordHash: string): Promise<boolean> {
    return this.helperService.bcryptCompare(passwordRaw, passwordHash)
  }

  passwordCreate(password: string, options?: IAuthPasswordOptions): IAuthPassword {
    const salt = this.createSalt(this.passwordSaltLength)
    const passwordHash = this.helperService.bcryptCreate(password, salt)

    const sinceDate = this.helperService.dateNow()
    const untilDate = this.helperService.dateForward(sinceDate, {
      seconds: options?.temporary ? this.passwordExpiredTemporary : this.passwordExpiredIn,
    })

    return {
      salt,
      passwordHash,
      passwordCreated: sinceDate,
      passwordExpired: untilDate,
    }
  }

  passwordCheckExpired(passwordExpired: Date): boolean {
    const nowDate = this.helperService.dateNow()
    const passwordExpiredConvert = this.helperService.dateCreate(passwordExpired)
    return nowDate > passwordExpiredConvert
  }

  passwordRandom(length: number = 15, options?: IStringRandomOptions): string {
    return this.helperService.randomString(length, options)
  }

  createUserToken(userIp: string, userAgent: IResult): string {
    return this.helperService.createUserToken(userIp, userAgent)
  }

  getLoginDate(): Date {
    return this.helperService.dateNow()
  }

  getTokenType(): string {
    return this.jwtPrefix
  }

  getRemainingExpirationTime(exp: number = null): number {
    const sinceDate = this.helperService.dateNow()
    const untilDate =
      exp !== null
        ? this.helperService.dateCreateFromGeneric(exp * 1000)
        : this.helperService.dateCreate(sinceDate, { endOfDay: true })

    const diffDate = this.helperService.dateDiff(untilDate, sinceDate)

    return diffDate.seconds ? diffDate.seconds : Math.floor(diffDate.milliseconds / 1000)
  }

  getAccessTokenExpirationTime(): number {
    return this.jwtAccessTokenExpirationTime
  }

  getRefreshTokenExpirationTime(): number {
    return this.jwtRefreshTokenExpirationTime
  }

  async getPasswordAttempt(): Promise<boolean> {
    return this.passwordAttempt
  }

  async getMaxPasswordAttempt(): Promise<number> {
    return this.passwordMaxAttempt
  }

  async appleGetTokenInfo(idToken: string): Promise<AuthSocialApplePayloadDto> {
    const payload = await verifyAppleToken({
      idToken,
      clientId: [this.appleClientId, this.appleSignInClientId],
    })

    return { email: payload.email }
  }

  async googleGetTokenInfo(idToken: string): Promise<AuthSocialGooglePayloadDto> {
    try {
      // const login: LoginTicket = await this.googleClient.verifyIdToken({
      //   idToken: idToken,
      // })
      // const payload = login.getPayload()

      const payload: TokenInfo = await this.googleClient.getTokenInfo(idToken)

      return { email: payload.email }
    } catch (err: unknown) {
      throw err
    }
  }

  private getLoginKey(userScope: EnumAuthScopeType, userId: string, userToken: string): string {
    return this.keyPattern
      .replace('{userScope}', userScope)
      .replace('{userId}', userId)
      .replace('{userToken}', userToken)
  }

  async getLogin(
    userScope: EnumAuthScopeType,
    session: Pick<IAuthUserSessionCache, 'userId' | 'userToken'>,
  ): Promise<IAuthUserSessionCache | null> {
    const key = this.getLoginKey(userScope, session.userId, session.userToken)
    const cached = await this.cache.get<IAuthUserSessionCache>(key)

    return cached ?? null
  }

  async setLogin(userScope: EnumAuthScopeType, session: IAuthUserSessionCache): Promise<void> {
    const key = this.getLoginKey(userScope, session.userId, session.userToken)
    const ttl = Math.floor(session.expiredAt.getTime() - this.helperService.dateNow().getTime())

    await this.cache.set<IAuthUserSessionCache>(key, session, ttl)

    return
  }

  async updateLogin(
    userScope: EnumAuthScopeType,
    session: IAuthUserSessionCache,
    updation: Pick<IAuthUserSessionCache, 'jti' | 'userToken'>,
    expiredInMs: number,
  ): Promise<void> {
    const key = this.getLoginKey(userScope, session.userId, session.userToken)
    await this.cache.set<IAuthUserSessionCache>(key, { ...session, jti: updation.jti }, expiredInMs)

    return
  }

  async deleteOneLogin(
    userScope: EnumAuthScopeType,
    session: Pick<IAuthUserSessionCache, 'userId' | 'userToken'>,
  ): Promise<void> {
    const key = this.getLoginKey(userScope, session.userId, session.userToken)
    await this.cache.del(key)

    return
  }

  async deleteAllLogins(
    userScope: EnumAuthScopeType,
    userId: string,
    userTokens: string[],
  ): Promise<void> {
    if (userTokens.length > 0) {
      const keys = userTokens.map(userToken => this.getLoginKey(userScope, userId, userToken))
      await this.cache.mdel(keys)
    }

    return
  }

  async flushAll(): Promise<void> {
    await this.cache.clear()
    return
  }
}
