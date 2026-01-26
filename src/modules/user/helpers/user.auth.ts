import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Prisma } from '@runtime/prisma-client'
import { plainToInstance } from 'class-transformer'
import {
  AuthJwtAccessPayloadDto,
  AuthJwtRefreshPayloadDto,
  AuthTokenResponseDto,
  AuthUtil,
  EnumAuthSignUpFrom,
  IAuthPayloadOptions,
  IAuthRefetchOptions,
  IAuthUserValidatorDto,
  IAuthValidator,
  IAuthValidatorOptions,
} from 'lib/nest-auth'
import { FileUtil, HelperService, IRequestApp } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { IResult } from 'ua-parser-js'
import {
  UserRequestChangePasswordDto,
  UserRequestSignInDto,
  UserRequestSignUpDto,
  UserResponseLoginDto,
  UserResponsePayloadDto,
} from '../dtos'
import { TUser } from '../interfaces'

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
  ) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async cleanUpRefreshTokens(): Promise<Date> {
    const nowDate = this.helperService.dateNow()
    await this.prisma.userTokenHistory.deleteMany({
      where: { refreshExpired: { lte: nowDate } },
    })
    return nowDate
  }

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
    payload: AuthJwtAccessPayloadDto,
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

    const userPayload = await this.serializeUserData(userData)
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

  private async serializeUserData(data: TUser): Promise<UserResponsePayloadDto> {
    return plainToInstance(UserResponsePayloadDto, data, {
      excludeExtraneousValues: true,
    })
  }

  private async checkRefreshTokenExpirationTime(
    refreshToken: string,
    refreshPayload: AuthJwtRefreshPayloadDto,
  ): Promise<boolean> {
    const userToken = await this.prisma.userTokenHistory.findFirst({
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
      await this.prisma.userTokenHistory.update({
        where: { id: userToken.id },
        data: { refreshAttempt: { increment: 1 } },
      })
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.refreshTokenExpired',
      })
    }

    if (
      userToken.userToken !== refreshPayload.loginToken ||
      userToken.userId !== refreshPayload.user.id
    ) {
      // kick users that logged in. user must login again
      await this.prisma.userTokenHistory.updateMany({
        where: { userId: userToken.userId },
        data: { isActive: false },
      })
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.refreshTokenLeaked',
      })
    }

    return true
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

  async validateCredentials(dto: UserRequestSignInDto): Promise<TUser> {
    const user = await this.matchOrFail(
      { email: dto.email },
      {
        include: this.authRelation,
      },
    )

    const validate = await this.authUtil.verify(dto.password, user.password)
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

  async login(
    user: TUser,
    userIp: string,
    userAgent: IResult,
    userRequest: IRequestApp,
    options: Partial<IAuthPayloadOptions>,
  ): Promise<UserResponseLoginDto> {
    if (!user.isActive) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.inactive',
      })
    }

    const checkPasswordExpired = this.authUtil.checkPasswordExpired(user.passwordExpired)
    if (checkPasswordExpired) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.passwordExpired',
      })
    }

    const payload = await this.serializeUserData(user)
    const payloadAccessToken = this.authUtil.createPayloadAccessToken(payload, {
      scopeType: options.scopeType,
      loginFrom: options.loginFrom,
      loginWith: options.loginWith,
      loginType: options.loginType,
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
    const accessToken = this.authUtil.createAccessToken(user.id, payloadAccessToken, expiresIn)

    const refreshToken = this.authUtil.createRefreshToken(user.id, payloadRefreshToken, refreshIn)

    await this.handleLoggedIn(user, {
      payload: payloadAccessToken,
      userToken: { refreshToken, refreshIn },
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
    user: TUser,
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

    const payload = await this.serializeUserData(user)
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
    const accessToken = this.authUtil.createAccessToken(user.email, payloadAccessToken, expiresIn)

    const refreshIn = this.authUtil.getRefreshTokenExpirationTime()
    const payloadRefreshToken = this.authUtil.createPayloadRefreshToken(
      payload.id,
      payloadAccessToken,
    )

    refreshToken = this.authUtil.createRefreshToken(user.id, payloadRefreshToken, refreshIn)

    await this.handleLoggedIn(user, {
      payload: payloadAccessToken,
      userToken: { refreshToken, refreshIn },
    })

    return { tokenType, expiresIn, accessToken, refreshToken }
  }

  async handleLoggedIn(user: TUser, options: IAuthRefetchOptions): Promise<boolean> {
    const { payload, userToken, userRequest } = options

    try {
      await this.prisma.user.update({
        data: { loginDate: payload.loginDate, loginToken: payload.loginToken, passwordAttempt: 0 },
        where: { id: user.id },
      })

      if (userToken) {
        // disabled old online refresh tokens
        await this.prisma.userTokenHistory.updateMany({
          data: { isActive: false, updatedAt: payload.loginDate },
          where: { userId: user.id, isActive: true, userToken: payload.loginToken },
        })
        await this.prisma.userTokenHistory.create({
          data: {
            isActive: true,
            userId: user.id,
            userToken: payload.loginToken,
            createdAt: payload.loginDate,
            updatedAt: payload.loginDate,
            refreshToken: userToken.refreshToken,
            refreshExpired: this.helperService.dateForward(new Date(payload.loginDate), {
              seconds: userToken.refreshIn,
            }),
          },
        })
        if (userRequest) {
          await this.prisma.userLoginHistory.create({
            data: {
              userId: user.id,
              hostname: userRequest?.hostname,
              ip: userRequest?.ip,
              protocol: userRequest?.protocol,
              originalUrl: userRequest?.originalUrl,
              method: userRequest?.method,
              userAgent: userRequest?.headers?.['user-agent'] as string,
              xForwardedFor: userRequest?.headers?.['x-forwarded-for'] as string,
              xForwardedHost: userRequest?.headers?.['x-forwarded-host'] as string,
              xForwardedPorto: userRequest?.headers?.['x-forwarded-porto'] as string,
              loginDate: payload.loginDate,
            },
          })
        }
      }
    } catch (err: unknown) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.hanleLoginData',
        _error: err,
      })
    }

    return true
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

    const matchPassword: boolean = await this.authUtil.verify(password, user.password)
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

    const matchPassword = await this.authUtil.verify(dto.oldPassword, user.password)
    if (!matchPassword) {
      await this.increasePasswordAttempt(user)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.passwordNotMatch',
      })
    }

    const newMatchPassword = await this.authUtil.verify(dto.newPassword, user.password)
    if (newMatchPassword) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.newPasswordMustDifference',
      })
    }

    const { passwordHash } = this.authUtil.createPassword(dto.newPassword)
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

    const matchPassword = await this.authUtil.verify(password, user.passwordConfirm)
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
    const { passwordHash } = this.authUtil.createPassword(password)
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

    const { passwordHash } = this.authUtil.createPassword(dto.password)
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
