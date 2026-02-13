import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnumVerificationChannel, Prisma } from '@runtime/prisma-client'
import { plainToInstance } from 'class-transformer'
import {
  AuthResponseLoginDto,
  AuthResponseTokenDto,
  AuthTwoFactorUtil,
  AuthUtil,
  IAuthJwtPayload,
  IAuthLoginOptions,
  IAuthPassword,
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
  SmsDispatcher,
} from 'lib/nest-core'
import { PrismaService, PrismaUtil } from 'lib/nest-prisma'
import { MemberChangePasswordRequestDto } from '../dtos/member.request.change-password.dto'
import { MemberResetPasswordRequestDto } from '../dtos/member.request.reset-password.dto'
import { MemberSignInRequestDto } from '../dtos/member.request.sign-in.dto'
import { MemberResponsePayloadDto } from '../dtos/member.response.payload.dto'
import { EnumMemberActivityAction } from '../enums/member.enum'
import {
  IMemberVerifyApproveOptions,
  IMemberVerifyCheckOptions,
  IMemberVerifySendEOTPOptions,
  IMemberVerifySendPOTPOptions,
  TMember,
} from '../interfaces/member.interface'
import { MemberUtil } from './member.util'

@Injectable()
export class MemberAuth implements IAuthValidator<TMember> {
  private readonly authRelation: Prisma.MemberInclude = {
    twoFactor: true,
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mailer: MailerService,
    private readonly message: MessageService,
    private readonly helperService: HelperService,
    private readonly smsDispatcher: SmsDispatcher,
    private readonly authUtil: AuthUtil,
    private readonly authTwoFactorUtil: AuthTwoFactorUtil,
    private readonly memberUtil: MemberUtil,
  ) {}

  async validatePayload(
    payload: IAuthJwtPayload,
    _request: IRequestApp,
    _options: IAuthValidatorOptions,
  ): Promise<IAuthUserValidatorDto> {
    const userData = await this.getUserData(payload.user.id)
    const userPayload = this.serializeUserData(userData)
    return { userData, userPayload }
  }

  async getUserData(userId: number): Promise<TMember> {
    const userData = await this.prisma.member
      .findUniqueOrThrow({ include: this.authRelation, where: { id: userId } })
      .catch((_err: unknown) => {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'auth.error.inactive',
        })
      })
    return userData
  }

  private serializeUserData(data: TMember): MemberResponsePayloadDto {
    return plainToInstance(MemberResponsePayloadDto, data, {
      excludeExtraneousValues: true,
    })
  }

  async matchOrFail(
    where: Prisma.MemberWhereInput,
    kwargs?: Omit<Prisma.MemberFindFirstOrThrowArgs, 'where'>,
  ): Promise<TMember> {
    const member = await this.prisma.member
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'auth.error.notFound',
        })
      })
    return member
  }

  async validateCredential(dto: MemberSignInRequestDto): Promise<TMember> {
    const member = await this.matchOrFail(
      { phone: dto.phone },
      {
        include: this.authRelation,
      },
    )

    if (!member.isEmailVerified && !member.isPhoneVerified) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.verified',
      })
    }

    const validate = await this.authUtil.passwordVerify(dto.password, member.password)
    if (!validate) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.passwordNotMatch',
      })
    }
    return member
  }

  async validateOAuthEmail(dto: { email: string }): Promise<TMember> {
    const member = await this.matchOrFail(
      { email: dto.email },
      {
        include: this.authRelation,
      },
    )
    return member
  }

  async login(member: TMember, options: IAuthLoginOptions): Promise<AuthResponseLoginDto> {
    if (!member.isActive) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.inactive',
      })
    }

    if (this.authUtil.passwordCheckExpired(member.passwordExpired)) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.passwordExpired',
      })
    }

    if (!member.twoFactor?.enabled) {
      const payload = this.serializeUserData(member)
      const session = this.authUtil.createSession(payload, options.userSession)

      const expiredAt = this.helperService.dateForward(this.helperService.dateNow(), {
        seconds: session.tokens.refreshIn,
      })

      await Promise.all([
        this.authUtil.setLogin(options.userSession.scopeType, {
          userId: member.id.toString(),
          userToken: session.loginToken,
          jti: session.jti,
          expiredAt,
        }),
        this.prisma.member.update({
          where: { id: member.id, deletedAt: null },
          data: {
            loginDate: session.loginDate,
            loginToken: session.loginToken,
            passwordExpired: expiredAt,
            sessions: {
              create: {
                jti: session.jti,
                expiredAt,
                userToken: session.loginToken,
                isRevoked: false,
                ipAddress: options.userIp,
                userAgent: PrismaUtil.toPlainObject(options.userAgent),
              },
            },
            activities: {
              create: {
                action: MemberUtil.getActivityLogin(options.userSession.loginType),
                ipAddress: options.userIp,
                userAgent: PrismaUtil.toPlainObject(options.userAgent),
              },
            },
            devices: {
              create: {
                type: options.userAgent?.device?.type ?? null,
                model: options.userAgent?.device?.model ?? null,
                version: options.userAgent?.os?.version ?? null,
                createdAt: session.loginDate,
                updatedAt: session.loginDate,
                token: options.userToken,
                isActive: true,
              },
            },
          },
        }),
      ])

      return {
        isTwoFactorEnable: false,
        token: session.tokens,
      }
    }

    const { challengeToken, expiresInMs } = await this.authTwoFactorUtil.createChallenge({
      userId: member.id,
      userSession: options.userSession,
    })

    return {
      isTwoFactorEnable: true,
      twoFactor: {
        isRequiredSetup: false,
        challengeToken,
        challengeExpiresInMs: expiresInMs,
        backupCodesRemaining: PrismaUtil.toPlainArray(member.twoFactor.backupCodes).length ?? 0,
      },
    }
  }

  async refresh(
    member: TMember,
    refreshToken: string,
    options: Omit<IAuthLoginOptions, 'userSession'>,
  ): Promise<AuthResponseTokenDto> {
    const refreshPayload = this.authUtil.payloadToken<MemberResponsePayloadDto>(refreshToken)

    if (!refreshPayload.loginRotate) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.refreshTokenUnauthorized',
      })
    }

    const cacheSession = await this.authUtil.getLogin(refreshPayload.scopeType, {
      userId: refreshPayload.user.id.toString(),
      userToken: refreshPayload.loginToken,
    })
    if (cacheSession.jti !== refreshPayload.jti) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'auth.error.refreshTokenInvalid',
      })
    }

    try {
      const payload = this.serializeUserData(member)
      const session = this.authUtil.createSession(payload, refreshPayload)

      await Promise.all([
        this.authUtil.updateLogin(
          refreshPayload.scopeType,
          cacheSession,
          {
            jti: session.jti,
            userToken: session.loginToken,
          },
          session.tokens.expiresIn,
        ),
        this.prisma.member.update({
          where: { id: member.id, deletedAt: null },
          data: {
            loginDate: session.loginDate,
            loginToken: session.loginToken,
            sessions: {
              update: {
                where: {
                  userToken: session.loginToken,
                },
                data: {
                  jti: session.jti,
                },
              },
            },
            activities: {
              create: {
                action: EnumMemberActivityAction.REFRESH_TOKEN,
                ipAddress: options.userIp,
                userAgent: PrismaUtil.toPlainObject(options.userAgent),
              },
            },
          },
        }),
      ])

      return session.tokens
    } catch (err: unknown) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'http.serverError.internalServerError',
        _error: err,
      })
    }
  }

  private async increasePasswordAttempt(user: TMember): Promise<void> {
    await this.prisma.member.update({
      data: { passwordAttempt: { increment: 1 } },
      where: { id: user.id },
    })
  }

  createPassword(password: string): IAuthPassword {
    return this.authUtil.passwordCreate(password)
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

    const matchPassword = await this.authUtil.passwordVerify(dto.oldPassword, member.password)
    if (!matchPassword) {
      await this.increasePasswordAttempt(member)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.passwordNotMatch',
      })
    }

    const newMatchPassword = this.authUtil.passwordVerify(dto.newPassword, member.password)
    if (newMatchPassword) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.newPasswordMustDifference',
      })
    }

    const { passwordHash } = this.authUtil.passwordCreate(dto.newPassword)
    return await this.prisma.member.update({
      data: { password: passwordHash, passwordAttempt: 0 },
      where: { id: member.id },
    })
  }

  async resetPassword(dto: MemberResetPasswordRequestDto): Promise<TMember> {
    const member = await this.matchOrFail({ phone: dto.phone })

    const { passwordHash } = this.authUtil.passwordCreate(dto.password)
    return await this.prisma.member.update({
      data: { password: passwordHash, passwordAttempt: 0 },
      where: { id: member.id },
    })
  }

  async sendPOPT(phone: string, options: IMemberVerifySendPOTPOptions): Promise<string> {
    const verifyData = await this.memberUtil.randomToken(EnumVerificationChannel.SMS, {
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

    options.drivers.forEach(driver => {
      this.smsDispatcher.dispatchAsync(driver, {
        phone,
        message: phoneMessage,
      })
    })

    return verifyData.code
  }

  async sendEOPT(email: string, options: IMemberVerifySendEOTPOptions): Promise<string> {
    const verifyData = await this.memberUtil.randomToken(EnumVerificationChannel.EMAIL, {
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
    const approved = await this.memberUtil.approveToken(token, options)
    return approved
  }

  async verifyToken(token: string, options: IMemberVerifyCheckOptions): Promise<boolean> {
    const verified = await this.memberUtil.checkToken(token, options)

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
