import { Controller, Get, HttpStatus, Inject, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  AuthJwtPayload,
  AuthJwtToken,
  AuthSocialAppleProtected,
  AuthSocialGoogleProtected,
  AuthResponseTokenDto,
  EnumAuthLoginFrom,
  EnumAuthLoginType,
  EnumAuthLoginWith,
  EnumAuthScopeType,
} from 'lib/nest-auth'
import {
  ApiRequestData,
  IResponseData,
  RequestBody,
  RequestUserAgent,
  RequestUserFrom,
  RequestUserIp,
  RequestUserToken,
} from 'lib/nest-web'
import { IResult } from 'ua-parser-js'
import { <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION } from '../constants/<%= singular(lowercased(name)) %>.doc.constant'
import { <%= singular(classify(name)) %>RequestChangePasswordDto } from '../dtos/<%= singular(lowercased(name)) %>.request.change-password.dto'
import { <%= singular(classify(name)) %>RequestSignInDto } from '../dtos/<%= singular(lowercased(name)) %>.request.sign-in.dto'
import { <%= singular(classify(name)) %>RequestSignUpDto } from '../dtos/<%= singular(lowercased(name)) %>.request.sign-up.dto'
import { <%= singular(classify(name)) %>ResponseProfileDto } from '../dtos/<%= singular(lowercased(name)) %>.response.profile.dto'
import { <%= singular(classify(name)) %>Auth } from '../helpers/<%= singular(lowercased(name)) %>.auth'

@ApiTags(<%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION)
@Controller({ version: '1', path: '/auth' })
export class <%= singular(classify(name)) %>AuthController {
  constructor(@Inject(EnumAuthScopeType.<%= authType %>) protected readonly userAuth: <%= singular(classify(name)) %>Auth) {}

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 10, seconds: 60 },
    },
    response: {
      dto: <%= singular(classify(name)) %>ResponseProfileDto,
    },
  })
  @Post('/sign-up')
  async signUp(@RequestBody() body: <%= singular(classify(name)) %>RequestSignUpDto): Promise<IResponseData> {
    const user = await this.userAuth.signUp(body)
    return { data: user }
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 10, seconds: 10 },
    },
    response: {
      dto: AuthResponseTokenDto,
      statusCode: HttpStatus.OK,
    },
  })
  @Post('/login')
  async loginWithCredential(
    @RequestUserIp() userIp: string,
    @RequestUserAgent() userAgent: IResult,
    @RequestUserToken() userToken: string,
    @RequestUserFrom() userFrom: EnumAuthLoginFrom,
    @RequestBody() body: <%= singular(classify(name)) %>RequestSignInDto,
  ): Promise<IResponseData> {
    const user = await this.userAuth.validateCredential(body)
    const auth = await this.userAuth.login(user, {
      userIp,
      userAgent,
      userToken,
      userSession: {
        scopeType: EnumAuthScopeType.USER,
        loginType: EnumAuthLoginType.CREDENTIAL,
        loginWith: EnumAuthLoginWith.PHONE,
        loginFrom: userFrom,
        loginRotate: body.rememberMe !== false,
      },
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION,
    docExclude: true,
    docExpansion: false,
    google: true,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 10, seconds: 60 },
    },
    response: {
      dto: AuthResponseTokenDto,
    },
  })
  @AuthSocialGoogleProtected()
  @Post('/login/social/google')
  async loginWithGoogle(
    @RequestUserIp() userIp: string,
    @RequestUserAgent() userAgent: IResult,
    @RequestUserToken() userToken: string,
    @RequestUserFrom() userFrom: EnumAuthLoginFrom,
    @AuthJwtPayload('user.email') email: string,
  ): Promise<IResponseData> {
    const user = await this.userAuth.validateOAuthEmail({ email })
    const auth = await this.userAuth.login(user, {
      userIp,
      userAgent,
      userToken,
      userSession: {
        scopeType: EnumAuthScopeType.USER,
        loginType: EnumAuthLoginType.SOCIAL_GOOGLE,
        loginWith: EnumAuthLoginWith.EMAIL,
        loginFrom: userFrom,
      },
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION,
    docExclude: true,
    docExpansion: false,
    apple: true,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 10, seconds: 60 },
    },
    response: {
      dto: AuthResponseTokenDto,
    },
  })
  @AuthSocialAppleProtected()
  @Post('/login/social/apple')
  async loginWithApple(
    @RequestUserIp() userIp: string,
    @RequestUserAgent() userAgent: IResult,
    @RequestUserToken() userToken: string,
    @RequestUserFrom() userFrom: EnumAuthLoginFrom,
    @AuthJwtPayload('user.email') email: string,
  ): Promise<IResponseData> {
    const user = await this.userAuth.validateOAuthEmail({ email })
    const auth = await this.userAuth.login(user, {
      userIp,
      userAgent,
      userToken,
      userSession: {
        scopeType: EnumAuthScopeType.USER,
        loginType: EnumAuthLoginType.SOCIAL_APPLE,
        loginWith: EnumAuthLoginWith.EMAIL,
        loginFrom: userFrom,
      },
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 5, seconds: 60 },
    },
    jwtAccessToken: {
      scope: EnumAuthScopeType.<%= authType %>,
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
    const user = await this.userAuth.getUserData(userId)
    return { data: user }
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtRefreshToken: true,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 5, seconds: 60 },
    },
    response: {
      dto: AuthResponseTokenDto,
      statusCode: HttpStatus.OK,
    },
  })
  @Post('/refresh')
  async refresh(
    @RequestUserIp() userIp: string,
    @RequestUserAgent() userAgent: IResult,
    @AuthJwtToken() refreshToken: string,
    @AuthJwtPayload('user.id') userId: number,
  ): Promise<IResponseData> {
    const user = await this.userAuth.getUserData(userId)
    const auth = await this.userAuth.refresh(user, refreshToken, {
      userIp,
      userAgent,
    })

    return { data: auth }
  }

  @ApiRequestData({
    summary: <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.<%= authType %>,
      user: {
        synchronize: true,
        require: true,
        active: true,
      },
    },
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 5, seconds: 60 },
    },
    response: {
      dto: <%= singular(classify(name)) %>ResponseProfileDto,
    },
  })
  @Put('/change-password')
  async changePassword(
    @RequestBody() body: <%= singular(classify(name)) %>RequestChangePasswordDto,
    @AuthJwtPayload('user.id') userId: number,
  ): Promise<IResponseData> {
    const user = await this.userAuth.findOrFail(userId)
    const updated = await this.userAuth.changePassword(user, body)

    return { data: updated }
  }
}
