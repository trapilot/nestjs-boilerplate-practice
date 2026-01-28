import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
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
  FileUtil,
  HelperService,
  IRequestApp,
  MailerService,
  MessageService,
  ScopeContext,
  SmsFactory,
} from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { IResult } from 'ua-parser-js'
import {
  MemberChangePasswordRequestDto,
  MemberPayloadResponseDto,
  MemberRequestSignUpDto,
  MemberResetPasswordRequestDto,
  MemberResponseLoginDto,
  MemberSignInRequestDto,
} from '../dtos'
import {
  IMemberVerifyApproveOptions,
  IMemberVerifyCheckOptions,
  IMemberVerifySendEOTPOptions,
  IMemberVerifySendPOTPOptions,
  TMember,
} from '../interfaces'
import { MemberService, VerificationService } from '../services'

@Injectable()
export class MemberAuth implements IAuthValidator<TMember> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mailer: MailerService,
    private readonly message: MessageService,
    private readonly helperService: HelperService,
    private readonly smsFactory: SmsFactory,
    private readonly authUtil: AuthUtil,
    @Inject(forwardRef(() => MemberService))
    private readonly memberService: MemberService,
    @Inject(forwardRef(() => VerificationService))
    private readonly verificationService: VerificationService,
  ) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async cleanUpRefreshTokens(): Promise<Date> {
    const nowDate = this.helperService.dateNow()
    await this.prisma.memberSession.deleteMany({
      where: { refreshExpired: { lte: nowDate } },
    })
    return nowDate
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
  ): Promise<boolean> {
    const userToken = await this.prisma.memberSession.findFirst({
      where: { refreshToken },
    })

    if (!userToken) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.refreshTokenUnauthorized',
      })
    }

    if (!userToken.isActive || this.helperService.dateIsAfter(userToken.refreshExpired)) {
      // tracking spam refresh token
      await this.prisma.memberSession.update({
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
      await this.prisma.memberSession.updateMany({
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

  async matchOrFail(
    where: Prisma.MemberWhereInput,
    include?: Prisma.MemberInclude,
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
    options: Partial<IAuthPayloadOptions>,
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
      loginToken: options?.loginToken ?? this.authUtil.createUserToken(userIp, userAgent),
      loginRotate: options?.loginRotate === true,
    })
    const payloadRefreshToken = this.authUtil.createPayloadRefreshToken(
      payload.id,
      payloadAccessToken,
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

    await this.handleLoggedIn(member, {
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
    refreshPayload: AuthJwtRefreshPayloadDto,
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
      payloadAccessToken,
    )

    refreshToken = this.authUtil.createRefreshToken(member.id, payloadRefreshToken, refreshIn)

    await this.handleLoggedIn(member, {
      payload: payloadAccessToken,
      userToken: { refreshToken, refreshIn },
    })

    return { tokenType, expiresIn, accessToken, refreshToken }
  }

  async handleLoggedIn(member: TMember, options: IAuthRefetchOptions): Promise<boolean> {
    const { payload, userToken, userAgent, userRequest: _userRequest } = options

    try {
      // update member login time
      await this.prisma.member.update({
        data: { loginDate: payload.loginDate, loginToken: payload.loginToken, passwordAttempt: 0 },
        where: { id: member.id },
      })

      if (userToken) {
        // disabled old online refresh tokens
        await this.prisma.memberSession.updateMany({
          data: { isActive: false, updatedAt: payload.loginDate },
          where: { memberId: member.id, isActive: true, memberToken: payload.loginToken },
        })
        await this.prisma.memberSession.create({
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
        await this.prisma.memberDevice.updateMany({
          data: { isActive: false, updatedAt: payload.loginDate },
          where: { token: payload.loginToken },
        })

        const userData: Prisma.MemberDeviceUncheckedCreateInput = {
          type: userAgent?.device?.type ?? null,
          model: userAgent?.device?.model ?? null,
          version: userAgent?.os?.version ?? null,
          createdAt: payload.loginDate,
          updatedAt: payload.loginDate,
          token: payload.loginToken,
          isActive: true,
          memberId: member.id,
        }
        await this.prisma.memberDevice.upsert({
          where: { memberId_token: { memberId: userData.memberId, token: userData.token } },
          update: userData,
          create: userData,
        })
      }
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

  async signUp(dto: MemberRequestSignUpDto): Promise<TMember> {
    const phoneExists = await this.prisma.member.exists({ phone: dto.phone })
    if (phoneExists) {
      throw new BadRequestException({
        statusCode: HttpStatus.CONFLICT,
        message: 'auth.error.phoneExist',
      })
    }

    const member = await this.memberService.create(
      {
        ...dto,
        type: EnumMemberType.NORMAL,
        isPhoneVerified: true,
      },
      this.authUtil.createPassword(dto.password),
    )

    return member
  }

  async sendPOPT(phone: string, options: IMemberVerifySendPOTPOptions): Promise<string> {
    const verifyData = await this.verificationService.randomToken(EnumVerificationChannel.SMS, {
      memberData: { phone },
      method: options.method,
      numeric: true,
      length: this.config.get<number>('auth.otp.length'),
      seconds: this.config.get<number>('auth.otp.ttl'),
      maxAttempts: this.config.get<number>('auth.otp.maxAttempts'),
    })

    const reqLanguage = options?.language || ScopeContext.getReqLang()
    const phoneContent = FileUtil.readTemplate(options.template.fileName, reqLanguage)
    const phoneMessage = this.message.setMessage(phoneContent, {
      customLanguage: reqLanguage,
      properties: {
        code: verifyData.code,
        ...(options?.template?.messageProperties || {}),
      },
    })

    options.dispatchers.forEach(driver =>
      this.smsFactory.getDriver(driver).send({ phone, message: phoneMessage }),
    )

    return verifyData.code
  }

  async sendEOPT(email: string, options: IMemberVerifySendEOTPOptions): Promise<string> {
    const verifyData = await this.verificationService.randomToken(EnumVerificationChannel.EMAIL, {
      memberData: { email },
      method: options.method,
      hashed: true,
      seconds: this.config.get<number>('auth.token.ttl'),
      length: this.config.get<number>('auth.token.length'),
      maxAttempts: this.config.get<number>('auth.token.maxAttempts'),
    })

    const reqLanguage = options?.language || ScopeContext.getReqLang()
    const emailContent = FileUtil.readTemplate(options.template.fileName, reqLanguage)
    const emailMessage = this.message.setMessage(emailContent, {
      customLanguage: reqLanguage,
      properties: {
        token: verifyData.code,
        subject: this.message.setMessage(options.subject, { customLanguage: reqLanguage }),
        ...(options?.template?.messageProperties || {}),
      },
    })

    await this.mailer.send({
      to: email,
      html: emailMessage,
    })

    return verifyData.code
  }

  async approveToken(token: string, options: IMemberVerifyApproveOptions): Promise<boolean> {
    const approved = await this.verificationService.approveToken(token, options)
    return approved
  }

  async verifyToken(token: string, options: IMemberVerifyCheckOptions): Promise<boolean> {
    const verified = await this.verificationService.checkToken(token, options)
    if (!verified) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.tokenInvalid',
      })
    }
    return true
  }

  async verifyMember(where: Prisma.MemberWhereInput): Promise<TMember> {
    const member = await this.matchOrFail(where)
    if (!member.isActive) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.blocked',
      })
    }

    return member
  }
}
