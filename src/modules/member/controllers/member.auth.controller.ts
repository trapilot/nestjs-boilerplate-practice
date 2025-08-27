import { Controller, HttpStatus, Inject, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ENUM_VERIFICATION_CHANNEL, ENUM_VERIFICATION_TYPE } from '@prisma/client'
import {
  AuthAccessResponseDto,
  AuthJwtPayload,
  AuthJwtRefreshPayloadDto,
  AuthJwtToken,
  AuthRefreshResponseDto,
  AuthSocialAppleProtected,
  AuthSocialGoogleProtected,
  ENUM_AUTH_LOGIN_FROM,
  ENUM_AUTH_LOGIN_TYPE,
  ENUM_AUTH_LOGIN_WITH,
  ENUM_AUTH_SCOPE_TYPE,
} from 'lib/nest-auth'
import { HelperStringService, IRequestApp } from 'lib/nest-core'
import {
  ApiRequestData,
  IResponseData,
  RequestApp,
  RequestBody,
  RequestUserAgent,
  RequestUserFrom,
  RequestUserIp,
  RequestUserOTP,
  RequestUserOTT,
  RequestUserToken,
} from 'lib/nest-web'
import { IResult } from 'ua-parser-js'
import { MEMBER_DOC_AUTH_OPERATION } from '../constants'
import {
  MemberProfileResponseDto,
  MemberRequestOTPDto,
  MemberRequestSignUpDto,
  MemberRequestTokenDto,
  MemberResetPasswordRequestDto,
  MemberSignInRequestDto,
} from '../dtos'
import { MemberAuthService } from '../services'

@ApiTags(MEMBER_DOC_AUTH_OPERATION)
@Controller({ version: '1', path: '/auth' })
export class MemberAuthController {
  constructor(
    @Inject(ENUM_AUTH_SCOPE_TYPE.MEMBER) protected readonly authService: MemberAuthService,
    protected readonly helperStringService: HelperStringService,
  ) {}

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    userOTP: true,
    rateLimit: {
      short: { limit: 2, ttl: 1_000 },
      long: { limit: 5, ttl: 60_000 },
    },
    response: {
      dto: MemberProfileResponseDto,
    },
  })
  @Post('/sign-up')
  async signUp(
    @RequestBody() body: MemberRequestSignUpDto,
    @RequestUserOTP() otp: string,
  ): Promise<IResponseData> {
    await this.authService.checkCode(otp, {
      channel: ENUM_VERIFICATION_CHANNEL.SMS,
      type: ENUM_VERIFICATION_TYPE.SIGN_UP,
      phone: body.phone,
    })

    const member = await this.authService.signUp(body)
    return { data: member }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    userAgent: true,
    userToken: true,
    rateLimit: {
      short: { limit: 2, ttl: 1_000 },
      long: { limit: 5, ttl: 60_000 },
    },
    response: {
      dto: AuthAccessResponseDto,
      statusCode: HttpStatus.OK,
    },
  })
  @Post('/login')
  async login(
    @RequestUserIp() userIp: string,
    @RequestUserAgent() userAgent: IResult,
    @RequestUserToken() userToken: string,
    @RequestUserFrom() userFrom: ENUM_AUTH_LOGIN_FROM,
    @RequestApp() userRequest: IRequestApp,
    @RequestBody() body: MemberSignInRequestDto,
  ): Promise<IResponseData> {
    const member = await this.authService.validateCredentials(body)
    const auth = await this.authService.login(member, userIp, userAgent, userRequest, {
      scopeType: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      loginType: ENUM_AUTH_LOGIN_TYPE.CREDENTIAL,
      loginWith: ENUM_AUTH_LOGIN_WITH.PHONE,
      loginFrom: userFrom,
      loginToken: userToken,
      loginRotate: false,
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    google: true,
    docExclude: true,
    rateLimit: {
      short: { limit: 2, ttl: 1_000 },
      long: { limit: 5, ttl: 60_000 },
    },
    response: {
      dto: AuthAccessResponseDto,
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
    @AuthJwtPayload<string>('user.email') email: string,
  ): Promise<IResponseData> {
    const member = await this.authService.validateOAuthEmail({ email })
    const auth = await this.authService.login(member, userIp, userAgent, userRequest, {
      scopeType: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      loginType: ENUM_AUTH_LOGIN_TYPE.SOCIAL_GOOGLE,
      loginWith: ENUM_AUTH_LOGIN_WITH.EMAIL,
      loginFrom: userFrom,
      loginToken: userToken,
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    apple: true,
    docExclude: true,
    rateLimit: {
      short: { limit: 2, ttl: 1_000 },
      long: { limit: 5, ttl: 60_000 },
    },
    response: {
      dto: AuthAccessResponseDto,
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
    const member = await this.authService.validateOAuthEmail({ email })
    const auth = await this.authService.login(member, userIp, userAgent, userRequest, {
      scopeType: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      loginType: ENUM_AUTH_LOGIN_TYPE.SOCIAL_APPLE,
      loginWith: ENUM_AUTH_LOGIN_WITH.EMAIL,
      loginFrom: userFrom,
      loginToken: userToken,
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    jwtRefreshToken: true,
    rateLimit: {
      short: { limit: 2, ttl: 1_000 },
      long: { limit: 5, ttl: 60_000 },
    },
    response: {
      dto: AuthRefreshResponseDto,
      statusCode: HttpStatus.OK,
    },
  })
  @Post('/refresh')
  async refresh(
    @AuthJwtToken() refreshToken: string,
    @AuthJwtPayload() refreshPayload: AuthJwtRefreshPayloadDto,
    @AuthJwtPayload('user.id') memberId: number,
  ): Promise<IResponseData> {
    const member = await this.authService.getUserData(memberId)
    const auth = await this.authService.refresh(member, refreshToken, refreshPayload)

    return { data: auth }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    userOTP: true,
    rateLimit: {
      short: { limit: 2, ttl: 1_000 },
      long: { limit: 5, ttl: 60_000 },
    },
    response: {
      dto: MemberProfileResponseDto,
    },
  })
  @Put('/reset-password')
  async resetPassword(
    @RequestBody() body: MemberResetPasswordRequestDto,
    @RequestUserOTP() otp: string,
  ): Promise<IResponseData> {
    await this.authService.checkCode(otp, {
      channel: ENUM_VERIFICATION_CHANNEL.SMS,
      type: ENUM_VERIFICATION_TYPE.RESET_PASSWORD,
      phone: body.phone,
    })

    const updated = await this.authService.resetPassword(body)
    return { data: updated }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    // docExclude: true,
    rateLimit: {
      short: { limit: 2, ttl: 1_000 },
      long: { limit: 5, ttl: 60_000 },
    },
  })
  @Post('/sign-up/request-otp')
  async requestSignUpOpt(@RequestBody() body: MemberRequestOTPDto): Promise<IResponseData> {
    const code = await this.authService.sendOPT(body.phone, {
      type: ENUM_VERIFICATION_TYPE.SIGN_UP,
      subject: 'opt.subject.sign-up',
      template: 'otp.sign-up.html',
    })
    return { data: { code } }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    userOTP: true,
    // docExclude: true,
    rateLimit: {
      short: { limit: 2, ttl: 1_000 },
      long: { limit: 5, ttl: 60_000 },
    },
  })
  @Post('/sign-up/verify-otp')
  async verifySignUpOpt(
    @RequestBody() body: MemberRequestOTPDto,
    @RequestUserOTP() otp: string,
  ): Promise<IResponseData> {
    const status = await this.authService.verifyOPT(otp, {
      type: ENUM_VERIFICATION_TYPE.SIGN_UP,
      phone: body.phone,
    })
    return { data: { status } }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    // docExclude: true,
    rateLimit: {
      short: { limit: 2, ttl: 1_000 },
      long: { limit: 5, ttl: 60_000 },
    },
  })
  @Post('/sign-up/request-token')
  async requestSignUpToken(@RequestBody() body: MemberRequestTokenDto): Promise<IResponseData> {
    const code = await this.authService.sendToken(body.email, {
      type: ENUM_VERIFICATION_TYPE.SIGN_UP,
      subject: 'email.subject.signUp',
      template: 'email.sign-up.html',
    })
    return { data: { code } }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    userOTT: true,
    // docExclude: true,
    rateLimit: {
      short: { limit: 2, ttl: 1_000 },
      long: { limit: 5, ttl: 60_000 },
    },
  })
  @Post('/sign-up/verify-token')
  async verifySignUpToken(
    @RequestBody() body: MemberRequestTokenDto,
    @RequestUserOTT() token: string,
  ): Promise<IResponseData> {
    const status = await this.authService.verifyToken(token, {
      type: ENUM_VERIFICATION_TYPE.SIGN_UP,
      email: body.email,
    })
    return { data: { status } }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    rateLimit: {
      short: { limit: 2, ttl: 1_000 },
      long: { limit: 5, ttl: 60_000 },
    },
  })
  @Post('/reset-password/request-otp')
  async requestResetPasswordOtp(@RequestBody() body: MemberRequestOTPDto): Promise<IResponseData> {
    const member = await this.authService.checkMember({ phone: body.phone })
    const code = await this.authService.sendOPT(body.phone, {
      type: ENUM_VERIFICATION_TYPE.RESET_PASSWORD,
      subject: 'email.subject.resetPassword',
      template: 'email.reset-password.html',
      language: member.locale,
      properties: member,
    })
    return { data: { code } }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    userOTP: true,
    rateLimit: {
      short: { limit: 2, ttl: 1_000 },
      long: { limit: 5, ttl: 60_000 },
    },
  })
  @Post('/reset-password/verify-otp')
  async verifyResetPasswordOtp(
    @RequestBody() body: MemberRequestOTPDto,
    @RequestUserOTP() otp: string,
  ): Promise<IResponseData> {
    await this.authService.checkMember({ phone: body.phone })
    const status = await this.authService.verifyOPT(otp, {
      type: ENUM_VERIFICATION_TYPE.RESET_PASSWORD,
      phone: body.phone,
    })
    return { data: { status } }
  }
}
