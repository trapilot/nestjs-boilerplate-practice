import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { plainToInstance } from 'class-transformer'
import {
  AuthResponseLoginDto,
  AuthResponseTokenDto,
  AuthTwoFactorUtil,
  AuthUtil,
  EnumAuthSignUpFrom,
  IAuthJwtPayload,
  IAuthLoginOptions,
  IAuthUserValidatorDto,
  IAuthValidator,
  IAuthValidatorOptions,
} from 'lib/nest-auth'
import { HelperService, IRequestApp } from 'lib/nest-core'
import { PrismaService, PrismaUtil } from 'lib/nest-prisma'
import { <%= singular(classify(name)) %>RequestChangePasswordDto } from '../dtos/<%= singular(lowercased(name)) %>.request.change-password.dto'
import { <%= singular(classify(name)) %>RequestSignInDto } from '../dtos/<%= singular(lowercased(name)) %>.request.sign-in.dto'
import { <%= singular(classify(name)) %>RequestSignUpDto } from '../dtos/<%= singular(lowercased(name)) %>.request.sign-up.dto'
import { <%= singular(classify(name)) %>ResponsePayloadDto } from '../dtos/<%= singular(lowercased(name)) %>.response.payload.dto'
import { Enum<%= singular(classify(name)) %>ActivityAction } from '../enums/<%= singular(lowercased(name)) %>.enum'
import { <%= singular(classify(name)) %>Util } from '../helpers/<%= singular(lowercased(name)) %>.util'
import { T<%= singular(classify(name)) %> } from '../interfaces/<%= singular(lowercased(name)) %>.interface'

@Injectable()
export class <%= singular(classify(name)) %>Auth implements IAuthValidator<T<%= singular(classify(name)) %>> {
  private readonly authRelation: Prisma.<%= singular(classify(name)) %>Include = {}

  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly authUtil: AuthUtil,
    private readonly authTwoFactorUtil: AuthTwoFactorUtil,
  ) {}

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
    if (Object.keys(this.authRelation).length) {
      for (const relation in this.authRelation) {
        delete userData[relation]
      }
    }
    return { userData, userPayload }
  }

  async getUserData(userId: number): Promise<T<%= singular(classify(name)) %>> {
    const userData = await this.prisma.<%= singular(lowercased(name)) %>
      .findUniqueOrThrow({ include: this.authRelation, where: { id: userId } })
      .catch((_err: unknown) => {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'auth.error.inactive',
        })
      })
    return userData
  }

  private serializeUserData(data: T<%= singular(classify(name)) %>): <%= singular(classify(name)) %>ResponsePayloadDto {
    return plainToInstance(<%= singular(classify(name)) %>ResponsePayloadDto, data, {
      excludeExtraneousValues: true,
    })
  }

  async findOrFail(
    id: number,
    kwargs?: Omit<Prisma.<%= singular(classify(name)) %>FindUniqueOrThrowArgs, 'where'>,
  ): Promise<T<%= singular(classify(name)) %>> {
    return await this.prisma.<%= singular(lowercased(name)) %>
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.<%= singular(lowercased(name)) %>.notFound',
        })
      })
  }

  async matchOrFail(
    where: Prisma.<%= singular(classify(name)) %>WhereInput,
    kwargs?: Omit<Prisma.<%= singular(classify(name)) %>FindFirstOrThrowArgs, 'where'>,
  ): Promise<T<%= singular(classify(name)) %>> {
    return await this.prisma.<%= singular(lowercased(name)) %>
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'auth.error.notFound',
        })
      })
  }

  async validateCredential(dto: <%= singular(classify(name)) %>RequestSignInDto): Promise<T<%= singular(classify(name)) %>> {
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

  async validateOAuthEmail(dto: { email: string }): Promise<T<%= singular(classify(name)) %>> {
    const user = await this.matchOrFail(
      { email: dto.email },
      {
        include: this.authRelation,
      },
    )
    return user
  }

  async login(user: T<%= singular(classify(name)) %>, options: IAuthLoginOptions): Promise<AuthResponseLoginDto> {
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
        this.prisma.<%= singular(lowercased(name)) %>.update({
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
                action: <%= singular(classify(name)) %>Util.getActivityLogin(options.userSession.loginType),
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
    user: T<%= singular(classify(name)) %>,
    refreshToken: string,
    options: Omit<IAuthLoginOptions, 'userSession'>,
  ): Promise<AuthResponseTokenDto> {
    const refreshPayload = this.authUtil.payloadToken<<%= singular(classify(name)) %>ResponsePayloadDto>(refreshToken)

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
        this.prisma.<%= singular(lowercased(name)) %>.update({
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
                action: Enum<%= singular(classify(name)) %>ActivityAction.REFRESH_TOKEN,
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

  private async increasePasswordAttempt(user: T<%= singular(classify(name)) %>): Promise<void> {
    await this.prisma.<%= singular(lowercased(name)) %>.update({
      data: { passwordAttempt: { increment: 1 } },
      where: { id: user.id },
    })
  }

  private async resetPasswordAttempt(user: T<%= singular(classify(name)) %>): Promise<void> {
    await this.prisma.<%= singular(lowercased(name)) %>.update({
      data: { passwordAttempt: 0 },
      where: { id: user.id },
    })
  }

  async verifyPassword(user: T<%= singular(classify(name)) %>, password: string): Promise<boolean> {
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

  async changePassword(user: T<%= singular(classify(name)) %>, dto: <%= singular(classify(name)) %>RequestChangePasswordDto): Promise<T<%= singular(classify(name)) %>> {
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
    return await this.prisma.<%= singular(lowercased(name)) %>.update({
      data: { password: passwordHash, passwordAttempt: 0 },
      where: { id: user.id },
    })
  }

  async signUp(dto: <%= singular(classify(name)) %>RequestSignUpDto): Promise<T<%= singular(classify(name)) %>> {
    const emailExists = await this.prisma.<%= singular(lowercased(name)) %>.count({ where: { email: dto.email } })
    if (emailExists) {
      throw new BadRequestException({
        statusCode: HttpStatus.CONFLICT,
        message: 'auth.error.emailExist',
      })
    }

    const { passwordHash } = this.authUtil.passwordCreate(dto.password)
    return await this.prisma.<%= singular(lowercased(name)) %>.create({
      data: {
        ...dto,
        isPhoneVerified: false,
        isEmailVerified: false,
        signUpFrom: EnumAuthSignUpFrom.CMS,
        password: passwordHash,
      },
    })
  }
}
