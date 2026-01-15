import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { plainToInstance } from 'class-transformer'
import {
  AuthJwtAccessPayloadDto,
  AuthJwtRefreshPayloadDto,
  AuthTokenResponseDto,
  AuthUtil,
  IAuthPassword,
  IAuthPayloadOptions,
  IAuthRefetchOptions,
  IAuthUserValidatorDto,
  IAuthValidator,
  IAuthValidatorOptions,
} from 'lib/nest-auth'
import { PrismaService } from 'lib/nest-prisma'
import { APP_TIMEZONE, HelperService, IRequestApp } from 'lib/nest-core'
import { IResult } from 'ua-parser-js'
import {
  <%= singular(classify(name)) %>RequestChangePasswordDto,
  <%= singular(classify(name)) %>RequestSignInDto,
  <%= singular(classify(name)) %>RequestSignUpDto,
  <%= singular(classify(name)) %>ResponseLoginDto,
  <%= singular(classify(name)) %>ResponsePayloadDto,
} from '../dtos'
import { T<%= singular(classify(name)) %> } from '../interfaces'

@Injectable()
export class AuthService implements IAuthValidator<T<%= singular(classify(name)) %>> {
  private readonly authRelation: Prisma.<%= singular(classify(name)) %>Include = {}

  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly authUtil: AuthUtil,
  ) {}

  async cleanUpRefreshTokens() {
    const nowDate = this.helperService.dateNow()
    await this.prisma.<%= singular(lowercased(name)) %>TokenHistory.deleteMany({
      where: { refreshExpired: { lte: nowDate } },
    })
  }

  async cleanUpPasswordAttempts() {
    await this.prisma.<%= singular(lowercased(name)) %>.updateMany({
      data: { passwordAttempt: 0 },
      where: { passwordAttempt: { gt: 0 }, isActive: true },
    })
  }

  async validatePayload(
    data: AuthJwtAccessPayloadDto,
    request: IRequestApp,
    options: IAuthValidatorOptions,
  ): Promise<IAuthUserValidatorDto> {
    const userData = await this.getUserData(data.user.id)
    const userPayload = await this.serializeUserData(userData)
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

  private async serializeUserData(data: T<%= singular(classify(name)) %>): Promise<<%= singular(classify(name)) %>ResponsePayloadDto> {
    return plainToInstance(<%= singular(classify(name)) %>ResponsePayloadDto, data, {
      excludeExtraneousValues: true,
    })
  }

  private async checkRefreshTokenExpirationTime(
    refreshToken: string,
    refreshPayload: AuthJwtRefreshPayloadDto,
  ) {
    const userToken = await this.prisma.<%= singular(lowercased(name)) %>TokenHistory.findFirst({
      where: { refreshToken },
      orderBy: [{ id: desc }],
    })

    if (!userToken) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.refreshTokenUnauthorized',
      })
    }

    if (!userToken.isActive || this.helperService.dateCheckAfter(userToken.refreshExpired)) {
      // tracking spam refresh token
      await this.prisma.<%= singular(lowercased(name)) %>TokenHistory.update({
        where: { id: userToken.id },
        data: { refreshAttempt: { increment: 1 } },
      })
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.refreshTokenExpired',
      })
    }

    if (
      userToken.<%= singular(lowercased(name)) %>Token !== refreshPayload.loginToken ||
      userToken.<%= singular(lowercased(name)) %>Id !== refreshPayload.user.id
    ) {
      // kick users that logged in. user must login again
      await this.prisma.<%= singular(lowercased(name)) %>TokenHistory.updateMany({
        where: { <%= singular(lowercased(name)) %>Id: userToken.<%= singular(lowercased(name)) %>Id },
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

  async credential(dto: <%= singular(classify(name)) %>RequestSignInDto) {
    const { country, phone } = this.helperService.parsePhone(dto.phone)
    const <%= singular(lowercased(name)) %> = await this.matchOrFail(
      { country, phone },
      { include: this.authRelation },
    )
    const validate: boolean = await this.authUtil.verify(dto.password, <%= singular(lowercased(name)) %>.password)
    if (!validate) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.passwordNotMatch',
      })
    }
    return <%= singular(lowercased(name)) %>
  }

  async certificate(dto: { email: string }): Promise<TUser> {
    const <%= singular(lowercased(name)) %> = await this.matchOrFail(
      { email: dto.email },
      { include: this.authRelation },
    )
    return <%= singular(lowercased(name)) %>
  }

  async login(
    <%= singular(lowercased(name)) %>: T<%= singular(classify(name)) %>,
    userIp: string,
    userAgent: IResult,
    userRequest: IRequestApp,
    options: Partial<IAuthPayloadOptions>,
  ): Promise<<%= singular(classify(name)) %>ResponseLoginDto> {
    if (!<%= singular(lowercased(name)) %>.isActive) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.inactive',
      })
    }

    const checkPasswordExpired = await this.authUtil.checkPasswordExpired(<%= singular(lowercased(name)) %>.passwordExpired)
    if (checkPasswordExpired) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.passwordExpired',
      })
    }

    const payload = await this.serializeUserData(<%= singular(lowercased(name)) %>)
    const payloadAccessToken = await this.authUtil.createPayloadAccessToken(payload, {
      scopeType: options.scopeType,
      loginFrom: options.loginFrom,
      loginWith: options.loginWith,
      loginType: options.loginType,
      loginDate: options?.loginDate ?? (await this.authUtil.getLoginDate()),
      loginToken: options?.loginToken ?? (await this.authUtil.createToken(userIp, userAgent)),
      loginRotate: options?.loginRotate === true,
    })

    const payloadRefreshToken = await this.authUtil.createPayloadRefreshToken(
      payload.id,
      payloadAccessToken,
    )

    const [expiresIn, refreshIn] = await Promise.all(
      options?.loginRotate === true
        ? [
            this.authUtil.getAccessTokenExpirationTime(),
            this.authUtil.getRefreshTokenExpirationTime(),
          ]
        : [this.authUtil.getRemainingExpirationTime(), 0],
    )

    const tokenType = await this.authUtil.getTokenType()
    const accessToken = await this.authUtil.createAccessToken(
      <%= singular(lowercased(name)) %>.id,
      payloadAccessToken,
      expiresIn,
    )

    const refreshToken = await this.authUtil.createRefreshToken(<%= singular(lowercased(name)) %>.id, payloadRefreshToken, refreshIn)

    await this.handleLogin(<%= singular(lowercased(name)) %>, {
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
    <%= singular(lowercased(name)) %>: T<%= singular(classify(name)) %>,
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

    const payload = await this.serializeUserData(<%= singular(lowercased(name)) %>)
    const payloadAccessToken = await this.authUtil.createPayloadAccessToken(payload, {
      scopeType: refreshPayload?.scopeType,
      loginType: refreshPayload?.loginType,
      loginFrom: refreshPayload?.loginFrom,
      loginWith: refreshPayload?.loginWith,
      loginDate: refreshPayload?.loginDate,
      loginToken: refreshPayload?.loginToken,
      loginRotate: refreshPayload?.loginRotate,
    })

    const tokenType = await this.authUtil.getTokenType()
    const expiresIn = await this.authUtil.getAccessTokenExpirationTime()
    const accessToken = await this.authUtil.createAccessToken(
      <%= singular(lowercased(name)) %>.id,
      payloadAccessToken,
      expiresIn,
    )

    const refreshIn = await this.authUtil.getRefreshTokenExpirationTime()
    const payloadRefreshToken = await this.authUtil.createPayloadRefreshToken(
      payload.id,
      payloadAccessToken,
    )

    refreshToken = await this.authUtil.createRefreshToken(
      <%= singular(lowercased(name)) %>.id,
      payloadRefreshToken,
      refreshIn,
    )

    await this.handleLogin(<%= singular(lowercased(name)) %>, {
      payload: payloadAccessToken,
      userToken: { refreshToken, refreshIn },
    })

    return { tokenType, expiresIn, accessToken, refreshToken }
  }

  async handleLogin(<%= singular(lowercased(name)) %>: T<%= singular(classify(name)) %>, options: IAuthRefetchOptions): Promise<boolean> {
    const { payload, userToken, userAgent, userRequest } = options

    try {
      await this.prisma.<%= singular(lowercased(name)) %>.update({
        data: { loginDate: payload.loginDate, loginToken: payload.loginToken, passwordAttempt: 0 },
        where: { id: <%= singular(lowercased(name)) %>.id },
      })

      if (userToken) {
        // disabled old online refresh tokens
        await this.prisma.<%= singular(lowercased(name)) %>TokenHistory.updateMany({
          data: { isActive: false, updatedAt: payload.loginDate },
          where: { <%= singular(lowercased(name)) %>Id: <%= singular(lowercased(name)) %>.id, isActive: true, <%= singular(lowercased(name)) %>Token: payload.loginToken },
        })
        await this.prisma.<%= singular(lowercased(name)) %>TokenHistory.create({
          data: {
            isActive: true,
            <%= singular(lowercased(name)) %>Id: <%= singular(lowercased(name)) %>.id,
            <%= singular(lowercased(name)) %>Token: payload.loginToken,
            createdAt: payload.loginDate,
            updatedAt: payload.loginDate,
            refreshToken: userToken.refreshToken,
            refreshExpired: this.helperService.dateForward(payload.loginDate, {
              seconds: userToken.refreshIn,
            }),
          },
        })
      }

      /*if (userRequest) {
        await this.prisma.<%= singular(lowercased(name)) %>LoginHistory.create({
          data: {
            userId: <%= singular(lowercased(name)) %>.id,
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
      }*/
      /*if (userAgent) {
        // disabled online devices
        await this.prisma.<%= singular(lowercased(name)) %>DeviceHistory.updateMany({
          data: { isActive: false, updatedAt: payload.loginDate },
          where: { token: payload.loginToken },
        })

        const <%= singular(lowercased(name)) %>Data: Prisma.<%= singular(classify(name)) %>DeviceHistoryUncheckedCreateInput = {
          type: userAgent?.device?.type ?? null,
          model: userAgent?.device?.model ?? null,
          version: userAgent?.os?.version ?? null,
          createdAt: payload.loginDate,
          updatedAt: payload.loginDate,
          token: payload.loginToken,
          isActive: true,
          <%= singular(lowercased(name)) %>Id: <%= singular(lowercased(name)) %>.id,
        }
        await this.prisma.<%= singular(lowercased(name)) %>DeviceHistory.upsert({
          where: { <%= singular(lowercased(name)) %>Id_token: { <%= singular(lowercased(name)) %>Id: userData.<%= singular(lowercased(name)) %>Id, token: userData.token } },
          update: userData,
          create: userData,
        })
      }*/
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.hanleLoginData',
      })
    }
    return true
  }

  private async increasePasswordAttempt(<%= singular(lowercased(name)) %>: T<%= singular(classify(name)) %>): Promise<void> {
    await this.prisma.<%= singular(lowercased(name)) %>.update({
      data: { passwordAttempt: { increment: 1 } },
      where: { id: <%= singular(lowercased(name)) %>.id },
    })
  }

  private async resetPasswordAttempt(<%= singular(lowercased(name)) %>: T<%= singular(classify(name)) %>): Promise<void> {
    await this.prisma.<%= singular(lowercased(name)) %>.update({
      data: { passwordAttempt: 0 },
      where: { id: <%= singular(lowercased(name)) %>.id },
    })
  }

  private async updatePassword(<%= singular(lowercased(name)) %>: T<%= singular(classify(name)) %>, { passwordHash }: IAuthPassword): Promise<boolean> {
    await this.prisma.<%= singular(lowercased(name)) %>.update({
      data: { password: passwordHash, passwordAttempt: 0 },
      where: { id: <%= singular(lowercased(name)) %>.id },
    })
    return true
  }

  async verifyPassword(<%= singular(lowercased(name)) %>: T<%= singular(classify(name)) %>, password: string): Promise<boolean> {
    const passwordAttempt = await this.authUtil.getPasswordAttempt()
    const maxPasswordAttempt = await this.authUtil.getMaxPasswordAttempt()
    if (passwordAttempt && <%= singular(lowercased(name)) %>.passwordAttempt >= maxPasswordAttempt) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.passwordAttemptMax',
      })
    }

    const matchPassword: boolean = await this.authUtil.verify(password, <%= singular(lowercased(name)) %>.password)
    if (!matchPassword) {
      await this.increasePasswordAttempt(<%= singular(lowercased(name)) %>)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.passwordNotMatch',
      })
    }
    await this.resetPasswordAttempt(<%= singular(lowercased(name)) %>)
    return true
  }

  async changePassword(<%= singular(lowercased(name)) %>: T<%= singular(classify(name)) %>, dto: <%= singular(classify(name)) %>RequestChangePasswordDto): Promise<boolean> {
    const passwordAttempt = await this.authUtil.getPasswordAttempt()
    const maxPasswordAttempt = await this.authUtil.getMaxPasswordAttempt()
    if (passwordAttempt && <%= singular(lowercased(name)) %>.passwordAttempt >= maxPasswordAttempt) {
      throw new BadRequestException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.passwordAttemptMax',
      })
    }

    const matchPassword: boolean = await this.authUtil.verify(dto.oldPassword, <%= singular(lowercased(name)) %>.password)
    if (!matchPassword) {
      await this.increasePasswordAttempt(<%= singular(lowercased(name)) %>)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.passwordNotMatch',
      })
    }

    const newMatchPassword: boolean = await this.authUtil.verify(dto.newPassword, <%= singular(lowercased(name)) %>.password)
    if (newMatchPassword) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.newPasswordMustDifference',
      })
    }

    const password = await this.authUtil.createPassword(dto.newPassword)
    return await this.updatePassword(<%= singular(lowercased(name)) %>, password)
  }

  async signUp(dto: <%= singular(classify(name)) %>RequestSignUpDto): Promise<T<%= singular(classify(name)) %>> {
    if (!!(await this.prisma.<%= singular(lowercased(name)) %>.count({ where: { email: dto.email } }))) {
      throw new BadRequestException({
        statusCode: HttpStatus.CONFLICT,
        message: 'auth.error.emailExist',
      })
    }

    const { passwordHash } = await this.authUtil.createPassword(dto.password)
    return await this.prisma.<%= singular(lowercased(name)) %>.create({
      data: {
        isActive: true,
        ...dto,
        password: passwordHash,
      },
    })
  }
}
