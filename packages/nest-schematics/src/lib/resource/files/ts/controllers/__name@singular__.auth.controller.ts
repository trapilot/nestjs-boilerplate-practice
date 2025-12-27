import { Controller, Get, HttpStatus, Inject, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  AuthJwtPayload,
  AuthJwtRefreshPayloadDto,
  AuthJwtToken,
  AuthSocialAppleProtected,
  AuthSocialGoogleProtected,
  AuthTokenResponseDto,
  ENUM_AUTH_LOGIN_FROM,
  ENUM_AUTH_LOGIN_TYPE,
  ENUM_AUTH_LOGIN_WITH,
  ENUM_AUTH_SCOPE_TYPE,
} from 'lib/nest-auth'
import { IRequestApp } from 'lib/nest-core'
import {
  ApiRequestData,
  IResponseData,
  RequestApp,
  RequestBody,
  RequestUserAgent,
  RequestUserFrom,
  RequestUserIp,
  RequestUserToken,
} from 'lib/nest-web'
import { IResult } from 'ua-parser-js'
import { <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION } from '../constants'
import {
  <%= singular(classify(name)) %>RequestChangePasswordDto,
  <%= singular(classify(name)) %>RequestSignInDto,
  <%= singular(classify(name)) %>RequestSignUpDto,
  <%= singular(classify(name)) %>ResponseProfileDto,
} from '../dtos'
import { <%= singular(classify(name)) %>AuthService } from '../services'

@ApiTags(<%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION)
@Controller({ version: '1', path: '/auth' })
export class <%= singular(classify(name)) %>AuthController {
  constructor(@Inject(ENUM_AUTH_SCOPE_TYPE.<%= authType %>) protected readonly authService: <%= singular(classify(name)) %>AuthService) {}

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION,
    response: {
      dto: <%= singular(classify(name)) %>ResponseProfileDto,
    },
  })
  @Post('/sign-up')
  async signUp(@RequestBody() body: <%= singular(classify(name)) %>RequestSignUpDto): Promise<IResponseData> {
    const user = await this.authService.signUp(body)
    return { data: user }
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 10, seconds: 10 },
    },
    response: {
      dto: AuthTokenResponseDto,
      statusCode: HttpStatus.OK,
    },
  })
  @Post('/login')
  async loginWithCredential(
    @RequestUserIp() userIp: string,
    @RequestUserAgent() userAgent: IResult,
    @RequestUserToken() userToken: string,
    @RequestUserFrom() userFrom: ENUM_AUTH_LOGIN_FROM,
    @RequestApp() userRequest: IRequestApp,
    @RequestBody() body: <%= singular(classify(name)) %>RequestSignInDto,
  ): Promise<IResponseData> {
    const user = await this.authService.credential(body)
    const auth = await this.authService.login(user, userIp, userAgent, userRequest, {
      scopeType: ENUM_AUTH_SCOPE_TYPE.<%= authType %>,
      loginType: ENUM_AUTH_LOGIN_TYPE.CREDENTIAL,
      loginWith: ENUM_AUTH_LOGIN_WITH.PHONE,
      loginFrom: userFrom,
      loginToken: userToken,
      loginRotate: body.rememberMe !== false,
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION,
    google: true,
    docExclude: true,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 10, seconds: 60 },
    },
    response: {
      dto: AuthTokenResponseDto,
    },
  })
  @AuthSocialGoogleProtected()
  @Post('/login/social/google')
  async loginWithGoogle(
    @RequestUserIp() userIp: string,
    @RequestUserAgent() userAgent: IResult,
    @RequestUserToken() userToken: string,
    @RequestUserFrom() userFrom: ENUM_AUTH_LOGIN_FROM,
    @RequestApp() userRequest: IRequestApp,
    @AuthJwtPayload('user.email') email: string,
  ): Promise<IResponseData> {
    const user = await this.authService.certificate({ email })
    const auth = await this.authService.login(user, userIp, userAgent, userRequest, {
      scopeType: ENUM_AUTH_SCOPE_TYPE.<%= authType %>,
      loginType: ENUM_AUTH_LOGIN_TYPE.SOCIAL_GOOGLE,
      loginWith: ENUM_AUTH_LOGIN_WITH.EMAIL,
      loginFrom: userFrom,
      loginToken: userToken,
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION,
    apple: true,
    docExclude: true,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 10, seconds: 60 },
    },
    response: {
      dto: AuthTokenResponseDto,
    },
  })
  @AuthSocialAppleProtected()
  @Post('/login/social/apple')
  async loginWithApple(
    @RequestUserIp() userIp: string,
    @RequestUserAgent() userAgent: IResult,
    @RequestUserToken() userToken: string,
    @RequestUserFrom() userFrom: ENUM_AUTH_LOGIN_FROM,
    @RequestApp() userRequest: IRequestApp,
    @AuthJwtPayload('user.email') email: string,
  ): Promise<IResponseData> {
    const user = await this.authService.certificate({ email })
    const auth = await this.authService.login(user, userIp, userAgent, userRequest, {
      scopeType: ENUM_AUTH_SCOPE_TYPE.<%= authType %>,
      loginType: ENUM_AUTH_LOGIN_TYPE.SOCIAL_APPLE,
      loginWith: ENUM_AUTH_LOGIN_WITH.EMAIL,
      loginFrom: userFrom,
      loginToken: userToken,
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 5, seconds: 60 },
    },
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.<%= authType %>,
      user: {
        synchronize: false,
        require: true,
        active: true,
      }
    },
    response: {
      dto: <%= singular(classify(name)) %>ResponseProfileDto,
    },
  })
  @Get('/_me')
  async me(@AuthJwtPayload('user.id') userId: number): Promise<IResponseData> {
    const user = await this.authService.getUserData(userId)
    return { data: user }
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION,
    jwtRefreshToken: true,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 5, seconds: 60 },
    },
    response: {
      dto: AuthTokenResponseDto,
      statusCode: HttpStatus.OK,
    },
  })
  @Post('/refresh')
  async refresh(
    @AuthJwtToken() refreshToken: string,
    @AuthJwtPayload() refreshPayload: AuthJwtRefreshPayloadDto,
    @AuthJwtPayload('user.id') userId: number,
  ): Promise<IResponseData> {
    const user = await this.authService.getUserData(userId)
    const auth = await this.authService.refresh(user, refreshToken, refreshPayload)

    return { data: auth }
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.<%= authType %>,
      user: {
        synchronize: true,
        require: true,
        active: true,
      },
    },
  })
  @Put('/change-password')
  async changePassword(
    @RequestBody() body: <%= singular(classify(name)) %>RequestChangePasswordDto,
    @AuthJwtPayload('user.id') userId: number,
  ): Promise<IResponseData> {
    const user = await this.authService.getUserData(userId)
    const status = await this.authService.changePassword(user, body)

    return {
      data: { status },
    }
  }
}
