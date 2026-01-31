import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Prisma } from '@runtime/prisma-client'
import { plainToInstance } from 'class-transformer'
import {
  AuthResponseLoginDto,
  AuthTokenResponseDto,
  AuthTwoFactorUtil,
  AuthUtil,
  EnumAuthSignUpFrom,
  IAuthJwtPayload,
  IAuthLoginOptions,
  IAuthUserValidatorDto,
  IAuthValidator,
  IAuthValidatorOptions,
} from 'lib/nest-auth'
import { FileUtil, HelperService, IRequestApp } from 'lib/nest-core'
import { PrismaService, PrismaUtil } from 'lib/nest-prisma'
import {
  UserRequestChangePasswordDto,
  UserRequestSignInDto,
  UserRequestSignUpDto,
  UserResponsePayloadDto,
} from '../dtos'
import { EnumUserActivityAction } from '../enums'
import { TUser } from '../interfaces'
import { UserUtil } from './user.util'

@Injectable()
export class UserAuth implements IAuthValidator<TUser> {
  private readonly authRelation: Prisma.UserInclude = {
    pivotRoles: {
      include: {
        role: {
          include: {
            pivotPermissions: {
              orderBy: { permission: { sorting: 'asc' } },
              include: { permission: true },
            },
          },
        },
      },
    },
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly authUtil: AuthUtil,
    private readonly authTwoFactorUtil: AuthTwoFactorUtil,
  ) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async cleanUpPasswordAttempts(): Promise<Date> {
    const nowDate = this.helperService.dateNow()
    await this.prisma.user.updateMany({
      data: { passwordAttempt: 0 },
      where: { passwordAttempt: { gt: 0 }, isActive: true },
    })
    return nowDate
  }

  async validatePayload(
    payload: IAuthJwtPayload,
    request: IRequestApp,
    options: IAuthValidatorOptions,
  ): Promise<IAuthUserValidatorDto> {
    const userData = await this.getUserData(payload.user.id)
    if (options?.hmac) {
      const verified = this.helperService.verifyUserHmac(userData.id, {
        key: userData.password,
        hmac: request.headers['x-user-hmac'] as string,
      })
      if (!verified) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'auth.error.requestNotValidated',
        })
      }
    }

    const userPayload = this.serializeUserData(userData)
    return { userData, userPayload }
  }

  async getUserData(userId: number): Promise<TUser> {
    const userData = await this.prisma.user
      .findUniqueOrThrow({ include: this.authRelation, where: { id: userId } })
      .catch((_err: unknown) => {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'auth.error.inactive',
        })
      })
    return userData
  }

  private serializeUserData(data: TUser): UserResponsePayloadDto {
    return plainToInstance(UserResponsePayloadDto, data, {
      excludeExtraneousValues: true,
    })
  }

  async findOrFail(
    id: number,
    kwargs?: Omit<Prisma.UserFindUniqueOrThrowArgs, 'where'>,
  ): Promise<TUser> {
    return await this.prisma.user
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'auth.error.notFound',
        })
      })
  }

  async matchOrFail(
    where: Prisma.UserWhereInput,
    kwargs?: Omit<Prisma.UserFindFirstOrThrowArgs, 'where'>,
  ): Promise<TUser> {
    const user = await this.prisma.user
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'auth.error.notFound',
        })
      })
    return user
  }

  async validateCredential(dto: UserRequestSignInDto): Promise<TUser> {
    const user = await this.matchOrFail(
      { email: dto.email },
      {
        include: this.authRelation,
      },
    )

    const validate = await this.authUtil.passwordVerify(dto.password, user.password)
    if (!validate) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.passwordNotMatch',
      })
    }
    return user
  }

  async validateOAuthEmail(dto: { email: string }): Promise<TUser> {
    const user = await this.matchOrFail(
      { email: dto.email },
      {
        include: this.authRelation,
      },
    )
    return user
  }

  async login(user: TUser, options: IAuthLoginOptions): Promise<AuthResponseLoginDto> {
    if (!user.isActive) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.inactive',
      })
    }

    const checkPasswordExpired = this.authUtil.passwordCheckExpired(user.passwordExpired)
    if (checkPasswordExpired) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.passwordExpired',
      })
    }

    if (!user.twoFactor?.enabled) {
      const payload = this.serializeUserData(user)
      const session = this.authUtil.createSession(payload, options.userSession)

      const expiredAt = this.helperService.dateForward(this.helperService.dateNow(), {
        seconds: session.tokens.refreshIn,
      })

      await Promise.all([
        this.authUtil.setLogin(options.userSession.scopeType, {
          userId: user.id.toString(),
          userToken: session.loginToken,
          jti: session.jti,
          expiredAt,
        }),
        this.prisma.user.update({
          where: { id: user.id, deletedAt: null },
          data: {
            loginDate: session.loginDate,
            loginToken: session.loginToken,
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
                action: UserUtil.getActivityLogin(options.userSession.loginType),
                ipAddress: options.userIp,
                userAgent: PrismaUtil.toPlainObject(options.userAgent),
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
      userId: user.id,
      userSession: options.userSession,
    })

    return {
      isTwoFactorEnable: true,
      twoFactor: {
        isRequiredSetup: false,
        challengeToken,
        challengeExpiresInMs: expiresInMs,
        backupCodesRemaining: PrismaUtil.toPlainArray(user.twoFactor.backupCodes).length ?? 0,
      },
    }
  }

  async refresh(
    user: TUser,
    refreshToken: string,
    options: Omit<IAuthLoginOptions, 'userSession'>,
  ): Promise<AuthTokenResponseDto> {
    const refreshPayload = this.authUtil.payloadToken<UserResponsePayloadDto>(refreshToken)

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
      const payload = this.serializeUserData(user)
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
        this.prisma.user.update({
          where: { id: user.id, deletedAt: null },
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
                action: EnumUserActivityAction.USER_REFRESH_TOKEN,
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

  private async increasePasswordAttempt(user: TUser): Promise<void> {
    await this.prisma.user.update({
      data: { passwordAttempt: { increment: 1 } },
      where: { id: user.id },
    })
  }

  private async resetPasswordAttempt(user: TUser): Promise<void> {
    await this.prisma.user.update({
      data: { passwordAttempt: 0 },
      where: { id: user.id },
    })
  }

  async verifyPassword(user: TUser, password: string): Promise<boolean> {
    const passwordAttempt = await this.authUtil.getPasswordAttempt()
    const maxPasswordAttempt = await this.authUtil.getMaxPasswordAttempt()
    if (passwordAttempt && user.passwordAttempt >= maxPasswordAttempt) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.passwordAttemptMax',
      })
    }

    const matchPassword = await this.authUtil.passwordVerify(password, user.password)
    if (!matchPassword) {
      await this.increasePasswordAttempt(user)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.passwordNotMatch',
      })
    }
    await this.resetPasswordAttempt(user)
    return true
  }

  async changePassword(user: TUser, dto: UserRequestChangePasswordDto): Promise<TUser> {
    const passwordAttempt = await this.authUtil.getPasswordAttempt()
    const maxPasswordAttempt = await this.authUtil.getMaxPasswordAttempt()
    if (passwordAttempt && user.passwordAttempt >= maxPasswordAttempt) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.passwordAttemptMax',
      })
    }

    const matchPassword = await this.authUtil.passwordVerify(dto.oldPassword, user.password)
    if (!matchPassword) {
      await this.increasePasswordAttempt(user)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.passwordNotMatch',
      })
    }

    const newMatchPassword = await this.authUtil.passwordVerify(dto.newPassword, user.password)
    if (newMatchPassword) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.newPasswordMustDifference',
      })
    }

    const { passwordHash } = this.authUtil.passwordCreate(dto.newPassword)
    return await this.prisma.user.update({
      data: { password: passwordHash, passwordAttempt: 0 },
      where: { id: user.id },
    })
  }

  async changeAvatar(user: TUser, data: Prisma.UserUncheckedUpdateInput): Promise<TUser> {
    return await this.prisma.$transaction(async tx => {
      const _user = await tx.user.update({ data, where: { id: user.id } })
      await FileUtil.removeLink(user.avatar)
      return _user
    })
  }

  async verifyConfirmPassword(user: TUser, password: string): Promise<string> {
    const passwordAttempt = await this.authUtil.getPasswordAttempt()
    const maxPasswordAttempt = await this.authUtil.getMaxPasswordAttempt()
    if (passwordAttempt && user.passwordAttempt >= maxPasswordAttempt) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.passwordAttemptMax',
      })
    }

    const matchPassword = await this.authUtil.passwordVerify(password, user.passwordConfirm)
    if (!matchPassword) {
      await this.increasePasswordAttempt(user)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.passwordNotMatch',
      })
    }
    await this.resetPasswordAttempt(user)

    return this.helperService.createUserHmac(user.id, {
      key: user.passwordConfirm,
    })
  }

  async changeConfirmPassword(password: string): Promise<boolean> {
    const { passwordHash } = this.authUtil.passwordCreate(password)
    await this.prisma.user.updateMany({
      data: {
        passwordConfirm: passwordHash,
        updatedAt: undefined,
      },
    })
    return true
  }

  async signUp(dto: UserRequestSignUpDto): Promise<TUser> {
    const emailExists = await this.prisma.user.count({ where: { email: dto.email } })
    if (emailExists) {
      throw new BadRequestException({
        statusCode: HttpStatus.CONFLICT,
        message: 'auth.error.emailExist',
      })
    }

    const { passwordHash } = this.authUtil.passwordCreate(dto.password)
    return await this.prisma.user.create({
      data: {
        ...dto,
        isPhoneVerified: false,
        isEmailVerified: false,
        signUpFrom: EnumAuthSignUpFrom.CMS,
        password: passwordHash,
      },
    })
  }

  async editProfile(id: number, dto: Prisma.UserUncheckedUpdateInput): Promise<TUser> {
    const user = await this.findOrFail(id)
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: dto,
    })
    const profile = await this.getUserData(updated.id)
    return profile
  }
}
