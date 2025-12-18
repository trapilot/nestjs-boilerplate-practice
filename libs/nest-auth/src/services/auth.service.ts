import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { OAuth2Client, TokenInfo } from 'google-auth-library'
import {
  CryptoService,
  DateService,
  ENUM_APP_ENVIRONMENT,
  HelperService,
  IStringRandomOptions,
} from 'lib/nest-core'
import { IResult } from 'ua-parser-js'
import verifyAppleToken from 'verify-apple-id-token'
import {
  AuthJwtAccessPayloadDto,
  AuthJwtRefreshPayloadDto,
  AuthSocialApplePayloadDto,
  AuthSocialGooglePayloadDto,
} from '../dtos'
import {
  IAuthPassword,
  IAuthPasswordOptions,
  IAuthPayloadOptions,
  IAuthRefetchOptions,
} from '../interfaces'

@Injectable()
export class AuthService {
  private readonly appEnv: string

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

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly dateService: DateService,
    private readonly cryptoService: CryptoService,
    private readonly helperService: HelperService,
  ) {
    this.appEnv = this.config.get<string>('app.env', ENUM_APP_ENVIRONMENT.PRODUCTION)

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

  createAccessToken(
    subject: string | number,
    payload: AuthJwtAccessPayloadDto,
    expiredIn: number,
  ): string {
    return this.jwtService.sign(payload, {
      secret: this.jwtAccessTokenSecretKey,
      expiresIn: expiredIn,
      audience: this.jwtAudience,
      issuer: this.jwtIssuer,
      subject: `${subject}`,
    })
  }

  validateAccessToken(subject: string, token: string): boolean {
    try {
      this.jwtService.verify(token, {
        secret: this.jwtAccessTokenSecretKey,
        audience: this.jwtAudience,
        issuer: this.jwtIssuer,
        subject,
        ignoreExpiration: false,
      })

      return true
    } catch {
      return false
    }
  }

  payloadAccessToken(token: string): AuthJwtAccessPayloadDto {
    return this.jwtService.decode<AuthJwtAccessPayloadDto>(token)
  }

  createRefreshToken(
    subject: string | number,
    payload: AuthJwtRefreshPayloadDto,
    expiredIn: number,
  ): string {
    return this.jwtService.sign(payload, {
      secret: this.jwtRefreshTokenSecretKey,
      audience: this.jwtAudience,
      issuer: this.jwtIssuer,
      subject: `${subject}`,
      expiresIn: expiredIn,
    })
  }

  validateRefreshToken(subject: string, token: string): boolean {
    try {
      this.jwtService.verify(token, {
        secret: this.jwtRefreshTokenSecretKey,
        audience: this.jwtAudience,
        issuer: this.jwtIssuer,
        subject,
        ignoreExpiration: false,
      })
      return true
    } catch (err: unknown) {
      return false
    }
  }

  payloadRefreshToken(token: string): AuthJwtRefreshPayloadDto {
    return this.jwtService.decode<AuthJwtRefreshPayloadDto>(token)
  }

  verify(passwordString: string, passwordHash: string): boolean {
    return this.cryptoService.bcryptCompare(passwordString, passwordHash)
  }

  async capture(user: any, options: IAuthRefetchOptions): Promise<boolean> {
    return false
  }

  createPayloadAccessToken<UserData = Record<string, any>>(
    data: UserData,
    options: IAuthPayloadOptions,
  ): AuthJwtAccessPayloadDto<UserData> {
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

  createPayloadRefreshToken(id: number, options: IAuthPayloadOptions): AuthJwtRefreshPayloadDto {
    return {
      user: { id },
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
    return this.cryptoService.randomSalt(length)
  }

  createPassword(password: string, options?: IAuthPasswordOptions): IAuthPassword {
    const salt: string = this.createSalt(this.passwordSaltLength)

    const dateNow = this.dateService.create()
    const passwordExpired = this.dateService.forward(dateNow, {
      seconds: options?.temporary ? this.passwordExpiredTemporary : this.passwordExpiredIn,
    })
    const passwordCreated = this.dateService.create()
    const passwordHash = this.cryptoService.bcrypt(password, salt)
    return {
      passwordHash,
      passwordExpired,
      passwordCreated,
      salt,
    }
  }

  createPasswordRandom(length: number = 15, options?: IStringRandomOptions): string {
    return this.helperService.randomString(length, options)
  }

  createToken(userIp: string, userAgent: IResult): string {
    return this.cryptoService.createUserToken(userIp, userAgent)
  }

  checkPasswordExpired(passwordExpired: Date): boolean {
    const today = this.dateService.create()
    const passwordExpiredConvert = this.dateService.create(passwordExpired)
    return today > passwordExpiredConvert
  }

  getLoginDate(): Date {
    return this.dateService.create()
  }

  getTokenType(): string {
    return this.jwtPrefix
  }

  getRemainingExpirationTime(): number {
    const dateNow = this.dateService.createInstance()
    return Math.floor(
      this.dateService
        .createInstance(dateNow.toJSDate(), { endOfDay: true })
        .diff(dateNow, 'seconds').seconds,
    )
  }

  getAccessTokenExpirationTime(): number {
    return this.jwtAccessTokenExpirationTime
  }

  getRefreshTokenExpirationTime(): number {
    return this.jwtRefreshTokenExpirationTime
  }

  getIssuer(): string {
    return this.jwtIssuer
  }

  getAudience(): string {
    return this.jwtAudience
  }

  getPasswordAttempt(): boolean {
    return this.passwordAttempt
  }

  getMaxPasswordAttempt(): number {
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
    } catch (err) {
      throw err
    }
  }
}
