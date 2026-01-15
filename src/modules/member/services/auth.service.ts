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
import { EnumMemberType, EnumVerificationChannel, Prisma } from '@runtime/prisma-client'
import { plainToInstance } from 'class-transformer'
import {
  AuthJwtAccessPayloadDto,
  AuthJwtRefreshPayloadDto,
  AuthTokenResponseDto,
  AuthUtil,
  IAuthPayloadOptions,
  IAuthRefetchOptions,
  IAuthUserValidatorDto,
  IAuthValidator,
  IAuthValidatorOptions,
} from 'lib/nest-auth'
import {
  APP_TIMEZONE,
  CryptoService,
  FileService,
  FileUtil,
  HelperService,
  IRequestApp,
  MessageService,
} from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { TierService } from 'modules/tier'
import { NotifierService } from 'shared/services'
import { IResult } from 'ua-parser-js'
import {
  MemberChangePasswordRequestDto,
  MemberPayloadResponseDto,
  MemberRequestSignUpDto,
  MemberResetPasswordRequestDto,
  MemberResponseLoginDto,
  MemberSignInRequestDto,
} from '../dtos'
import { MemberSignInEvent } from '../events'
import {
  IVerificationCreateOptions,
  IVerificationSendOptions,
  IVerificationVerifyOptions,
  TMember,
} from '../interfaces'
import { MemberService } from './member.service'
import { VerifyService } from './verify.service'

@Injectable()
export class AuthService implements IAuthValidator<TMember>, OnModuleInit {
  private tierService: TierService
  private verifyService: VerifyService

  constructor(
    private readonly ref: ModuleRef,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly emitter: EventEmitter2,
    private readonly message: MessageService,
    private readonly crypto: CryptoService,
    private readonly fileService: FileService,
    private readonly notifyService: NotifierService,
    private readonly helperService: HelperService,
    private readonly authUtil: AuthUtil
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM, { timeZone: APP_TIMEZONE })
  async cleanUpRefreshTokens(): Promise<Date> {
    const nowDate = this.helperService.dateNow()
    await this.prisma.memberTokenHistory.deleteMany({
      where: { refreshExpired: { lte: nowDate } },
    })
    return nowDate
  }

  onModuleInit(): void {
    this.verifyService = this.ref.get(VerifyService, { strict: true })
    this.tierService = this.ref.get(TierService, { strict: false })
  }

  async validatePayload(
    payload: AuthJwtAccessPayloadDto,
    _request: IRequestApp,
    _options: IAuthValidatorOptions
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
    refreshPayload: AuthJwtRefreshPayloadDto
  ): Promise<boolean> {
    const userToken = await this.prisma.memberTokenHistory.findFirst({
      where: { refreshToken },
    })

    if (!userToken) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.refreshTokenUnauthorized',
      })
    }

    if (!userToken.isActive || this.helperService.dateCheckAfter(userToken.refreshExpired)) {
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
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'auth.error.notFound',
        })
      })
  }

  async differOrFail(
    where: Prisma.MemberWhereInput,
    options?: { limit?: number; message?: string }
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
    include?: Prisma.MemberInclude
  ): Promise<TMember> {
    const member = await this.prisma.member
      .findFirstOrThrow({ where, include })
      .catch((_err: unknown) => {
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

    const validate = await this.authUtil.verify(dto.password, member.password)
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
    options: Partial<IAuthPayloadOptions>
  ): Promise<MemberResponseLoginDto> {
    if (!member.isActive) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.inactive',
      })
    }

    const checkPasswordExpired = this.authUtil.checkPasswordExpired(member.passwordExpired)
    if (checkPasswordExpired) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.passwordExpired',
      })
    }

    const payload = await this.serializeUserData(member)
    const payloadAccessToken = this.authUtil.createPayloadAccessToken(payload, {
      scopeType: options.scopeType,
      loginType: options.loginType,
      loginFrom: options.loginFrom,
      loginWith: options.loginWith,
      loginDate: options?.loginDate ?? this.authUtil.getLoginDate(),
      loginToken: options?.loginToken ?? this.authUtil.createToken(userIp, userAgent),
      loginRotate: options?.loginRotate === true,
    })
    const payloadRefreshToken = this.authUtil.createPayloadRefreshToken(
      payload.id,
      payloadAccessToken
    )

    const [expiresIn, refreshIn] =
      options?.loginRotate === true
        ? [
            this.authUtil.getAccessTokenExpirationTime(),
            this.authUtil.getRefreshTokenExpirationTime(),
          ]
        : [this.authUtil.getRemainingExpirationTime(), 0]

    const tokenType = this.authUtil.getTokenType()
    const accessToken = this.authUtil.createAccessToken(member.id, payloadAccessToken, expiresIn)
    const refreshToken = this.authUtil.createRefreshToken(member.id, payloadRefreshToken, refreshIn)

    await this.handleLogin(member, {
      payload: payloadAccessToken,
      userToken: { refreshToken, refreshIn },
      userAgent,
      userRequest,
    })

    return {
      isTwoFactorEnable: false,
      token: {
        tokenType,
        expiresIn,
        accessToken,
        refreshToken,
      },
    }
  }

  async refresh(
    member: TMember,
    refreshToken: string,
    refreshPayload: AuthJwtRefreshPayloadDto
  ): Promise<AuthTokenResponseDto> {
    if (!refreshPayload?.loginRotate) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.refreshTokenUnauthorized',
      })
    }

    await this.checkRefreshTokenExpirationTime(refreshToken, refreshPayload)

    const payload = await this.serializeUserData(member)
    const payloadAccessToken = this.authUtil.createPayloadAccessToken(payload, {
      scopeType: refreshPayload?.scopeType,
      loginType: refreshPayload?.loginType,
      loginFrom: refreshPayload?.loginFrom,
      loginWith: refreshPayload?.loginWith,
      loginDate: refreshPayload?.loginDate,
      loginToken: refreshPayload?.loginToken,
      loginRotate: refreshPayload?.loginRotate,
    })

    const tokenType = this.authUtil.getTokenType()
    const expiresIn = this.authUtil.getAccessTokenExpirationTime()
    const accessToken = this.authUtil.createAccessToken(member.id, payloadAccessToken, expiresIn)
    const refreshIn = this.authUtil.getRefreshTokenExpirationTime()
    const payloadRefreshToken = this.authUtil.createPayloadRefreshToken(
      payload.id,
      payloadAccessToken
    )

    refreshToken = this.authUtil.createRefreshToken(member.id, payloadRefreshToken, refreshIn)

    await this.handleLogin(member, {
      payload: payloadAccessToken,
      userToken: { refreshToken, refreshIn },
    })

    return { tokenType, expiresIn, accessToken, refreshToken }
  }

  async handleLogin(member: TMember, options: IAuthRefetchOptions): Promise<boolean> {
    const { payload, userToken, userAgent, userRequest: _userRequest } = options

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
            refreshExpired: this.helperService.dateForward(new Date(payload.loginDate), {
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
        new MemberSignInEvent(member.id, payload.loginToken)
      )
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.hanleLoginData',
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
    const passwordAttempt = await this.authUtil.getPasswordAttempt()
    const maxPasswordAttempt = await this.authUtil.getMaxPasswordAttempt()
    if (passwordAttempt && member.passwordAttempt >= maxPasswordAttempt) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.passwordAttemptMax',
      })
    }

    const matchPassword: boolean = await this.authUtil.verify(dto.oldPassword, member.password)
    if (!matchPassword) {
      await this.increasePasswordAttempt(member)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.passwordNotMatch',
      })
    }

    const newMatchPassword = this.authUtil.verify(dto.newPassword, member.password)
    if (newMatchPassword) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.newPasswordMustDifference',
      })
    }

    const { passwordHash } = this.authUtil.createPassword(dto.newPassword)
    return await this.prisma.member.update({
      data: { password: passwordHash, passwordAttempt: 0 },
      where: { id: member.id },
    })
  }

  async resetPassword(dto: MemberResetPasswordRequestDto): Promise<TMember> {
    const member = await this.matchOrFail({ phone: dto.phone })

    const { passwordHash } = this.authUtil.createPassword(dto.password)
    return await this.prisma.member.update({
      data: { password: passwordHash, passwordAttempt: 0 },
      where: { id: member.id },
    })
  }

  async sendOPT(phone: string, options: IVerificationSendOptions): Promise<string> {
    const verify = await this.verifyService.random(
      { channel: EnumVerificationChannel.SMS, type: options.type, phone },
      {
        numeric: true,
        length: this.config.get<number>('auth.otp.length'),
        seconds: this.config.get<number>('auth.otp.ttl'),
        maxAttempts: this.config.get<number>('auth.otp.maxAttempts'),
      }
    )

    const content = options?.text
      ? options.text
      : this.fileService.readText(FileUtil.getTemplate(options.template, options?.language))

    await this.notifyService.sendSms({
      to: phone,
      subject: this.message.setMessage(options?.subject, {
        customLanguage: options?.language,
      }),
      content: this.message.setMessage(content, {
        properties: {
          code: verify.code,
          ...(options?.properties || {}),
        },
      }),
    })

    return verify.code
  }

  async verifyOPT(opt: string, options: IVerificationVerifyOptions): Promise<boolean> {
    const status = await this.verifyService.verify(opt, {
      channel: EnumVerificationChannel.SMS,
      ...options,
    })
    return status
  }

  async sendToken(email: string, options: IVerificationSendOptions): Promise<string> {
    const verify = await this.verifyService.random(
      { channel: EnumVerificationChannel.EMAIL, type: options.type, email },
      {
        seconds: this.config.get<number>('auth.token.ttl'),
        length: this.config.get<number>('auth.token.length'),
        maxAttempts: this.config.get<number>('auth.token.maxAttempts'),
      }
    )

    const token = this.crypto.base64Encrypt(JSON.stringify({ email, code: verify.code }))

    const content = options?.text
      ? options.text
      : this.fileService.readText(FileUtil.getTemplate(options.template, options?.language))

    await this.notifyService.sendEmail({
      to: email,
      content: this.message.setMessage(content, {
        properties: {
          url: token,
          token,
          subject: this.message.setMessage(options?.subject, {
            customLanguage: options?.language,
          }),
          ...(options?.properties || {}),
        },
      }),
    })

    return verify.code
  }

  async verifyToken(token: string, options: IVerificationVerifyOptions): Promise<boolean> {
    const status = await this.verifyService.verify(token, {
      channel: EnumVerificationChannel.EMAIL,
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
    const status = await this.verifyService.check(code, options)
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

    const { country, phone } = this.helperService.parsePhone(dto.phone)
    const { passwordHash } = this.authUtil.createPassword(dto.password)

    const normalTier = this.tierService.getChart().getNormalTier()
    const member = await this.prisma.member.create({
      data: {
        ...dto,
        tierId: normalTier.id,
        minTierId: normalTier.id,
        type: EnumMemberType.NORMAL,
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
