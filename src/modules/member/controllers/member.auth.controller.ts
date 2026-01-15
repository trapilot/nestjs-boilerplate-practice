import { Controller, HttpStatus, Inject, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { EnumVerificationChannel, EnumVerificationMethod } from '@runtime/prisma-client'
import {
  AuthJwtPayload,
  AuthJwtRefreshPayloadDto,
  AuthJwtToken,
  AuthSocialAppleProtected,
  AuthSocialGoogleProtected,
  AuthTokenResponseDto,
  EnumAuthLoginFrom,
  EnumAuthLoginType,
  EnumAuthLoginWith,
  EnumAuthScopeType,
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
  MemberResponseLoginDto,
  MemberSignInRequestDto,
} from '../dtos'
import { AuthService } from '../services'

@ApiTags(MEMBER_DOC_AUTH_OPERATION)
@Controller({ version: '1', path: '/auth' })
export class MemberAuthController {
  constructor(@Inject(EnumAuthScopeType.MEMBER) protected readonly authService: AuthService) {}

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    userOTP: true,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 10, seconds: 60 },
    },
    response: {
      dto: MemberProfileResponseDto,
    },
  })
  @Post('/sign-up')
  async signUp(
    @RequestBody() body: MemberRequestSignUpDto,
    @RequestUserOTP() otp: string
  ): Promise<IResponseData> {
    await this.authService.checkCode(otp, {
      channel: EnumVerificationChannel.SMS,
      type: EnumVerificationMethod.SIGN_UP,
      phone: body.phone,
    })

    const member = await this.authService.signUp(body)
    return { data: member }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    userAgent: true,
    userToken: true,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 10, seconds: 60 },
    },
    response: {
      dto: MemberResponseLoginDto,
      statusCode: HttpStatus.OK,
    },
  })
  @Post('/login')
  async loginWithCredential(
    @RequestUserIp() userIp: string,
    @RequestUserAgent() userAgent: IResult,
    @RequestUserToken() userToken: string,
    @RequestUserFrom() userFrom: EnumAuthLoginFrom,
    @RequestApp() userRequest: IRequestApp,
    @RequestBody() body: MemberSignInRequestDto
  ): Promise<IResponseData> {
    const member = await this.authService.validateCredentials(body)
    const auth = await this.authService.login(member, userIp, userAgent, userRequest, {
      scopeType: EnumAuthScopeType.MEMBER,
      loginType: EnumAuthLoginType.CREDENTIAL,
      loginWith: EnumAuthLoginWith.PHONE,
      loginFrom: userFrom,
      loginToken: userToken,
      loginRotate: false,
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    docExclude: true,
    docExpansion: false,
    google: true,
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
    @RequestUserFrom() userFrom: EnumAuthLoginFrom,
    @RequestApp() userRequest: IRequestApp,
    @AuthJwtPayload<string>('user.email') email: string
  ): Promise<IResponseData> {
    const member = await this.authService.validateOAuthEmail({ email })
    const auth = await this.authService.login(member, userIp, userAgent, userRequest, {
      scopeType: EnumAuthScopeType.MEMBER,
      loginType: EnumAuthLoginType.SOCIAL_GOOGLE,
      loginWith: EnumAuthLoginWith.EMAIL,
      loginFrom: userFrom,
      loginToken: userToken,
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    docExclude: true,
    docExpansion: false,
    apple: true,
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
    @RequestUserFrom() userFrom: EnumAuthLoginFrom,
    @RequestApp() userRequest: IRequestApp,
    @AuthJwtPayload('user.email') email: string
  ): Promise<IResponseData> {
    const member = await this.authService.validateOAuthEmail({ email })
    const auth = await this.authService.login(member, userIp, userAgent, userRequest, {
      scopeType: EnumAuthScopeType.MEMBER,
      loginType: EnumAuthLoginType.SOCIAL_APPLE,
      loginWith: EnumAuthLoginWith.EMAIL,
      loginFrom: userFrom,
      loginToken: userToken,
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
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
    @AuthJwtPayload('user.id') memberId: number
  ): Promise<IResponseData> {
    const member = await this.authService.getUserData(memberId)
    const auth = await this.authService.refresh(member, refreshToken, refreshPayload)

    return { data: auth }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    userOTP: true,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 5, seconds: 60 },
    },
    response: {
      dto: MemberProfileResponseDto,
    },
  })
  @Put('/reset-password')
  async resetPassword(
    @RequestBody() body: MemberResetPasswordRequestDto,
    @RequestUserOTP() otp: string
  ): Promise<IResponseData> {
    await this.authService.checkCode(otp, {
      channel: EnumVerificationChannel.SMS,
      type: EnumVerificationMethod.RESET_PASSWORD,
      phone: body.phone,
    })

    const updated = await this.authService.resetPassword(body)
    return { data: updated }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 5, seconds: 60 },
    },
  })
  @Post('/sign-up/request-otp')
  async requestSignUpOpt(@RequestBody() body: MemberRequestOTPDto): Promise<IResponseData> {
    const code = await this.authService.sendOPT(body.phone, {
      type: EnumVerificationMethod.SIGN_UP,
      subject: 'opt.subject.sign-up',
      template: 'otp.sign-up.html',
    })
    return { data: { code } }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    userOTP: true,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 5, seconds: 60 },
    },
  })
  @Post('/sign-up/verify-otp')
  async verifySignUpOpt(
    @RequestBody() body: MemberRequestOTPDto,
    @RequestUserOTP() otp: string
  ): Promise<IResponseData> {
    const status = await this.authService.verifyOPT(otp, {
      type: EnumVerificationMethod.SIGN_UP,
      phone: body.phone,
    })
    return { data: { status } }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 5, seconds: 60 },
    },
  })
  @Post('/sign-up/request-token')
  async requestSignUpToken(@RequestBody() body: MemberRequestTokenDto): Promise<IResponseData> {
    const code = await this.authService.sendToken(body.email, {
      type: EnumVerificationMethod.SIGN_UP,
      subject: 'email.subject.signUp',
      template: 'email.sign-up.html',
    })
    return { data: { code } }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    userOTT: true,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 5, seconds: 60 },
    },
  })
  @Post('/sign-up/verify-token')
  async verifySignUpToken(
    @RequestBody() body: MemberRequestTokenDto,
    @RequestUserOTT() token: string
  ): Promise<IResponseData> {
    const status = await this.authService.verifyToken(token, {
      type: EnumVerificationMethod.SIGN_UP,
      email: body.email,
    })
    return { data: { status } }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 5, seconds: 60 },
    },
  })
  @Post('/reset-password/request-otp')
  async requestResetPasswordOtp(@RequestBody() body: MemberRequestOTPDto): Promise<IResponseData> {
    const member = await this.authService.checkMember({ phone: body.phone })
    const code = await this.authService.sendOPT(body.phone, {
      type: EnumVerificationMethod.RESET_PASSWORD,
      subject: 'email.subject.resetPassword',
      template: 'email.reset-password.html',
      language: member.locale,
      properties: {},
    })
    return { data: { code } }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    userOTP: true,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 5, seconds: 60 },
    },
  })
  @Post('/reset-password/verify-otp')
  async verifyResetPasswordOtp(
    @RequestBody() body: MemberRequestOTPDto,
    @RequestUserOTP() otp: string
  ): Promise<IResponseData> {
    await this.authService.checkMember({ phone: body.phone })
    const status = await this.authService.verifyOPT(otp, {
      type: EnumVerificationMethod.RESET_PASSWORD,
      phone: body.phone,
    })
    return { data: { status } }
  }
}
