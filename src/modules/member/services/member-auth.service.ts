import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ModuleRef } from '@nestjs/core'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ENUM_MEMBER_TYPE, ENUM_VERIFICATION_CHANNEL, Prisma } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import {
  AuthJwtAccessPayloadDto,
  AuthJwtRefreshPayloadDto,
  AuthService,
  IAuthPayloadOptions,
  IAuthRefetchOptions,
  IAuthUserValidatorDto,
  IAuthValidator,
  IAuthValidatorOptions,
  ITokenPayload,
} from 'lib/nest-auth'
import {
  APP_PATH,
  APP_TIMEZONE,
  HelperCryptoService,
  HelperDateService,
  HelperFileService,
  HelperMessageService,
  HelperStringService,
  IRequestApp,
} from 'lib/nest-core'
import { NotifierService } from 'lib/nest-notifier'
import { PrismaService } from 'lib/nest-prisma'
import { join } from 'path'
import { TierService } from 'src/modules/tier/services'
import { IResult } from 'ua-parser-js'
import {
  MemberChangePasswordRequestDto,
  MemberPayloadResponseDto,
  MemberRequestSignUpDto,
  MemberResetPasswordRequestDto,
  MemberSignInRequestDto,
} from '../dtos'
import { MemberSignInEvent } from '../events'
import {
  IVerificationCreateOptions,
  IVerificationSendOptions,
  IVerificationVerifyOptions,
  TMember,
} from '../interfaces'
import { MemberVerificationService } from './member-verification.service'
import { MemberService } from './member.service'

@Injectable()
export class MemberAuthService implements IAuthValidator<TMember>, OnModuleInit {
  private tierService: TierService
  private verifier: MemberVerificationService
  constructor(
    private readonly ref: ModuleRef,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly emitter: EventEmitter2,
    private readonly notifier: NotifierService,
    private readonly authService: AuthService,
    private readonly helperFileService: HelperFileService,
    private readonly helperDateService: HelperDateService,
    private readonly helperStringService: HelperStringService,
    private readonly helperCryptoService: HelperCryptoService,
    private readonly helperMessageService: HelperMessageService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM, { timeZone: APP_TIMEZONE })
  private async clearExpiredRefreshTokens() {
    const dateNow = this.helperDateService.create()
    await this.prisma.memberTokenHistory.deleteMany({
      where: { refreshExpired: { lte: dateNow } },
    })
  }

  onModuleInit() {
    this.verifier = this.ref.get(MemberVerificationService, { strict: true })
    this.tierService = this.ref.get(TierService, { strict: false })
  }

  async validatePayload(
    payload: AuthJwtAccessPayloadDto,
    _request: IRequestApp,
    _options: IAuthValidatorOptions,
  ): Promise<IAuthUserValidatorDto> {
    const userData = await this.getUserData(payload.user.id)
    const userPayload = await this.serializeUserData(userData)
    return { userData, userPayload }
  }

  async getUserData(userId: number): Promise<TMember> {
    const userData = await this.prisma.member
      .findUniqueOrThrow({ where: { id: userId } })
      .catch((_err: unknown) => {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'auth.error.inactive',
        })
      })
    return userData
  }

  private async serializeUserData(data: TMember): Promise<MemberPayloadResponseDto> {
    return plainToInstance(MemberPayloadResponseDto, data, {
      excludeExtraneousValues: true,
    })
  }

  private async checkRefreshTokenExpirationTime(
    refreshToken: string,
    refreshPayload: AuthJwtRefreshPayloadDto,
  ) {
    const userToken = await this.prisma.memberTokenHistory.findFirst({
      where: { refreshToken },
    })

    if (!userToken) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.refreshTokenUnauthorized',
      })
    }

    if (!userToken.isActive || this.helperDateService.after(userToken.refreshExpired)) {
      // tracking spam refresh token
      await this.prisma.memberTokenHistory.update({
        where: { id: userToken.id },
        data: { refreshAttempt: { increment: 1 } },
      })
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.refreshTokenExpired',
      })
    }

    if (
      userToken.memberToken !== refreshPayload.loginToken ||
      userToken.memberId !== refreshPayload.user.id
    ) {
      // kick users that logged in. user must login again
      await this.prisma.memberTokenHistory.updateMany({
        where: { memberId: userToken.memberId },
        data: { isActive: false },
      })
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.refreshTokenLeaked',
      })
    }
    return true
  }

  async findOrFail(id: number, include?: Prisma.MemberInclude): Promise<TMember> {
    return await this.prisma.member
      .findUniqueOrThrow({ include, where: { id } })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'auth.error.notFound',
        })
      })
  }

  async differOrFail(
    where: Prisma.MemberWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.member.conflict',
      })
    }
  }

  async matchOrFail(
    where: Prisma.MemberWhereInput,
    include?: Prisma.MemberInclude,
  ): Promise<TMember> {
    const member = await this.prisma.member
      .findFirstOrThrow({ where, include })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'auth.error.notFound',
        })
      })
    return member
  }

  async count(where?: Prisma.MemberWhereInput): Promise<number> {
    return await this.prisma.member.count({
      where,
    })
  }

  async validateCredentials(dto: MemberSignInRequestDto): Promise<TMember> {
    const member = await this.matchOrFail({ phone: dto.phone })

    if (!member.isEmailVerified && !member.isPhoneVerified) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.verified',
      })
    }

    const validate = await this.authService.verify(dto.password, member.password)
    if (!validate) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.passwordNotMatch',
      })
    }
    return member
  }

  async validateOAuthEmail(dto: { email: string }): Promise<TMember> {
    const member = await this.matchOrFail({ email: dto.email })
    return member
  }

  async login(
    member: TMember,
    userIp: string,
    userAgent: IResult,
    userRequest: IRequestApp,
    userAuth: Partial<IAuthPayloadOptions>,
  ): Promise<ITokenPayload> {
    if (!member.isActive) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.inactive',
      })
    }

    const checkPasswordExpired = this.authService.checkPasswordExpired(member.passwordExpired)
    if (checkPasswordExpired) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.passwordExpired',
      })
    }

    const payload = await this.serializeUserData(member)
    const payloadAccessToken = this.authService.createPayloadAccessToken(payload, {
      scopeType: userAuth.scopeType,
      loginType: userAuth.loginType,
      loginFrom: userAuth.loginFrom,
      loginWith: userAuth.loginWith,
      loginDate: userAuth?.loginDate ?? this.authService.getLoginDate(),
      loginToken: userAuth?.loginToken ?? this.authService.createToken(userIp, userAgent),
      loginRotate: userAuth?.loginRotate === true,
    })
    const payloadRefreshToken = this.authService.createPayloadRefreshToken(
      payload.id,
      payloadAccessToken,
    )

    const [expiresIn, refreshIn] =
      userAuth?.loginRotate === true
        ? [
            this.authService.getAccessTokenExpirationTime(),
            this.authService.getRefreshTokenExpirationTime(),
          ]
        : [this.authService.getRemainingExpirationTime(), 0]

    const tokenType = this.authService.getTokenType()
    const accessToken = this.authService.createAccessToken(member.id, payloadAccessToken, expiresIn)
    const refreshToken = this.authService.createRefreshToken(
      member.id,
      payloadRefreshToken,
      refreshIn,
    )

    await this.capture(member, {
      payload: payloadAccessToken,
      userToken: { refreshToken, refreshIn },
      userAgent,
      userRequest,
    })

    return { tokenType, expiresIn, accessToken, refreshToken }
  }

  async refresh(
    member: TMember,
    refreshToken: string,
    refreshPayload: AuthJwtRefreshPayloadDto,
  ): Promise<ITokenPayload> {
    if (!refreshPayload?.loginRotate) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.refreshTokenUnauthorized',
      })
    }

    await this.checkRefreshTokenExpirationTime(refreshToken, refreshPayload)

    const payload = await this.serializeUserData(member)
    const payloadAccessToken = this.authService.createPayloadAccessToken(payload, {
      scopeType: refreshPayload?.scopeType,
      loginType: refreshPayload?.loginType,
      loginFrom: refreshPayload?.loginFrom,
      loginWith: refreshPayload?.loginWith,
      loginDate: refreshPayload?.loginDate,
      loginToken: refreshPayload?.loginToken,
      loginRotate: refreshPayload?.loginRotate,
    })

    const tokenType = this.authService.getTokenType()
    const expiresIn = this.authService.getAccessTokenExpirationTime()
    const accessToken = this.authService.createAccessToken(member.id, payloadAccessToken, expiresIn)
    const refreshIn = this.authService.getRefreshTokenExpirationTime()
    const payloadRefreshToken = this.authService.createPayloadRefreshToken(
      payload.id,
      payloadAccessToken,
    )

    refreshToken = this.authService.createRefreshToken(member.id, payloadRefreshToken, refreshIn)

    await this.capture(member, {
      payload: payloadAccessToken,
      userToken: { refreshToken, refreshIn },
    })

    return { tokenType, expiresIn, accessToken, refreshToken }
  }

  async capture(member: TMember, options: IAuthRefetchOptions): Promise<boolean> {
    const { payload, userToken, userAgent, userRequest } = options

    try {
      // update member login time
      await this.prisma.member.update({
        data: { loginDate: payload.loginDate, loginToken: payload.loginToken, passwordAttempt: 0 },
        where: { id: member.id },
      })

      if (userToken) {
        // disabled old online refresh tokens
        await this.prisma.memberTokenHistory.updateMany({
          data: { isActive: false, updatedAt: payload.loginDate },
          where: { memberId: member.id, isActive: true, memberToken: payload.loginToken },
        })
        await this.prisma.memberTokenHistory.create({
          data: {
            isActive: true,
            memberId: member.id,
            memberToken: payload.loginToken,
            createdAt: payload.loginDate,
            updatedAt: payload.loginDate,
            refreshToken: userToken.refreshToken,
            refreshExpired: this.helperDateService.forward(new Date(payload.loginDate), {
              seconds: userToken.refreshIn,
            }),
          },
        })
      }

      if (userAgent) {
        // disabled online devices
        await this.prisma.memberDeviceHistory.updateMany({
          data: { isActive: false, updatedAt: payload.loginDate },
          where: { token: payload.loginToken },
        })

        const userData: Prisma.MemberDeviceHistoryUncheckedCreateInput = {
          type: userAgent?.device?.type ?? null,
          model: userAgent?.device?.model ?? null,
          version: userAgent?.os?.version ?? null,
          createdAt: payload.loginDate,
          updatedAt: payload.loginDate,
          token: payload.loginToken,
          isActive: true,
          memberId: member.id,
        }
        await this.prisma.memberDeviceHistory.upsert({
          where: { memberId_token: { memberId: userData.memberId, token: userData.token } },
          update: userData,
          create: userData,
        })
      }

      this.emitter.emit(
        MemberSignInEvent.eventPath,
        new MemberSignInEvent(member.id, payload.loginToken),
      )
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.captureLoginData',
      })
    }
    return true
  }

  private async increasePasswordAttempt(user: TMember): Promise<void> {
    await this.prisma.member.update({
      data: { passwordAttempt: { increment: 1 } },
      where: { id: user.id },
    })
  }

  async changePassword(member: TMember, dto: MemberChangePasswordRequestDto): Promise<TMember> {
    const passwordAttempt = await this.authService.getPasswordAttempt()
    const maxPasswordAttempt = await this.authService.getMaxPasswordAttempt()
    if (passwordAttempt && member.passwordAttempt >= maxPasswordAttempt) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.passwordAttemptMax',
      })
    }

    const matchPassword: boolean = await this.authService.verify(dto.oldPassword, member.password)
    if (!matchPassword) {
      await this.increasePasswordAttempt(member)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.passwordNotMatch',
      })
    }

    const newMatchPassword = this.authService.verify(dto.newPassword, member.password)
    if (newMatchPassword) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.newPasswordMustDifference',
      })
    }

    const { passwordHash } = this.authService.createPassword(dto.newPassword)
    return await this.prisma.member.update({
      data: { password: passwordHash, passwordAttempt: 0 },
      where: { id: member.id },
    })
  }

  async resetPassword(dto: MemberResetPasswordRequestDto): Promise<TMember> {
    const member = await this.matchOrFail({ phone: dto.phone })

    const { passwordHash } = this.authService.createPassword(dto.password)
    return await this.prisma.member.update({
      data: { password: passwordHash, passwordAttempt: 0 },
      where: { id: member.id },
    })
  }

  async sendOPT(phone: string, options: IVerificationSendOptions): Promise<string> {
    const verify = await this.verifier.random(
      { channel: ENUM_VERIFICATION_CHANNEL.SMS, type: options.type, phone },
      {
        numeric: true,
        length: this.config.get<number>('auth.otp.length'),
        seconds: this.config.get<number>('auth.otp.ttl'),
        maxAttempts: this.config.get<number>('auth.otp.maxAttempts'),
      },
    )

    const content = options?.text
      ? options?.text
      : this.helperFileService.readTemplate(join(APP_PATH, 'views', 'templates'), {
          template: options.template,
          // language: options?.language, --> multiple languages if neeeded
        })

    await this.notifier.sendSms({
      to: phone,
      subject: this.helperMessageService.setMessage(options?.subject, {
        customLanguage: options?.language,
      }),
      content: this.helperMessageService.setMessage(content, {
        properties: {
          code: verify.code,
          ...(options?.properties || {}),
        },
      }),
    })

    return verify.code
  }

  async verifyOPT(opt: string, options: IVerificationVerifyOptions): Promise<boolean> {
    const status = await this.verifier.verify(opt, {
      channel: ENUM_VERIFICATION_CHANNEL.SMS,
      ...options,
    })
    return status
  }

  async sendToken(email: string, options: IVerificationSendOptions): Promise<string> {
    const verify = await this.verifier.random(
      { channel: ENUM_VERIFICATION_CHANNEL.EMAIL, type: options.type, email },
      {
        seconds: this.config.get<number>('auth.token.ttl'),
        length: this.config.get<number>('auth.token.length'),
        maxAttempts: this.config.get<number>('auth.token.maxAttempts'),
      },
    )

    const token = this.helperCryptoService.base64Encrypt(
      JSON.stringify({ email, code: verify.code }),
    )

    const content = options?.text
      ? options.text
      : this.helperFileService.readTemplate(join(APP_PATH, 'views', 'templates'), {
          template: options.template,
          // language: options?.memberLang, --> multiple languages if neeeded
        })

    await this.notifier.sendEmail({
      to: email,
      content: this.helperMessageService.setMessage(content, {
        properties: {
          url: token,
          token,
          subject: this.helperMessageService.setMessage(options?.subject, {
            customLanguage: options?.language,
          }),
          ...(options?.properties || {}),
        },
      }),
    })

    return verify.code
  }

  async verifyToken(token: string, options: IVerificationVerifyOptions): Promise<boolean> {
    const status = await this.verifier.verify(token, {
      channel: ENUM_VERIFICATION_CHANNEL.EMAIL,
      ...options,
    })
    return status
  }

  async checkMember(where: Prisma.MemberWhereInput): Promise<TMember> {
    const member = await this.matchOrFail(where)
    if (!member.isActive) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.blocked',
      })
    }

    return member
  }

  async checkCode(code: string, options: IVerificationCreateOptions): Promise<boolean> {
    const status = await this.verifier.check(code, options)
    return status
  }

  async signUp(dto: MemberRequestSignUpDto): Promise<TMember> {
    const phoneExists = await this.prisma.member.count({
      where: { phone: dto.phone },
    })

    if (phoneExists) {
      throw new BadRequestException({
        statusCode: HttpStatus.CONFLICT,
        message: 'auth.error.phoneExist',
      })
    }

    const { country, phone } = this.helperStringService.parsePhone(dto.phone)
    const { passwordHash } = this.authService.createPassword(dto.password)

    const normalTier = this.tierService.getChartIterator().getNormalTier()
    const member = await this.prisma.member.create({
      data: {
        ...dto,
        tierId: normalTier.id,
        minTierId: normalTier.id,
        type: ENUM_MEMBER_TYPE.NORMAL,
        phoneCountry: country,
        phoneNumber: phone,
        isPhoneVerified: true,
        password: passwordHash,
      },
    })

    const memberService = this.ref.get<MemberService>(MemberService, { strict: false })
    return await memberService.onCreated(member)
  }
}
