import { Controller, HttpStatus, Inject, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { EnumVerificationChannel, EnumVerificationMethod } from '@runtime/prisma-client'
import {
  AuthJwtPayload,
  AuthJwtToken,
  AuthResponseLoginDto,
  AuthResponseTokenDto,
  AuthSocialAppleProtected,
  AuthSocialGoogleProtected,
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
  RequestUserOTP,
  RequestUserOTT,
  RequestUserToken,
} from 'lib/nest-web'
import { IResult } from 'ua-parser-js'
import { MEMBER_AUTH_TOKEN } from '../constants/member.constant'
import { MEMBER_DOC_AUTH_OPERATION } from '../constants/member.doc.constant'
import { MemberResetPasswordRequestDto } from '../dtos/member.request.reset-password.dto'
import { MemberSignInRequestDto } from '../dtos/member.request.sign-in.dto'
import { MemberRequestSignUpDto } from '../dtos/member.request.sign-up.dto'
import { MemberRequestOTPDto, MemberRequestTokenDto } from '../dtos/member.request.verify-profile'
import { MemberProfileResponseDto } from '../dtos/member.response.profile.dto'
import { MemberAuth } from '../helpers/member.auth'
import { MemberService } from '../services/member.service'

@ApiTags(MEMBER_DOC_AUTH_OPERATION)
@Controller({ version: '1', path: '/auth' })
export class MemberAuthController {
  constructor(
    @Inject(MEMBER_AUTH_TOKEN) protected readonly memberAuth: MemberAuth,
    protected readonly memberService: MemberService,
  ) {}

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
    @RequestUserOTP() otp: string,
  ): Promise<IResponseData> {
    await this.memberAuth.verifyToken(otp, {
      channel: EnumVerificationChannel.SMS,
      method: EnumVerificationMethod.SIGN_UP,
      phone: body.phone,
    })

    const { password, ...data } = body
    const member = await this.memberService.create(
      {
        ...data,
        isPhoneVerified: true,
      },
      this.memberAuth.createPassword(password),
    )

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
      dto: AuthResponseLoginDto,
      statusCode: HttpStatus.OK,
    },
  })
  @Post('/login')
  async loginWithCredential(
    @RequestUserIp() userIp: string,
    @RequestUserAgent() userAgent: IResult,
    @RequestUserToken() userToken: string,
    @RequestUserFrom() userFrom: EnumAuthLoginFrom,
    @RequestBody() body: MemberSignInRequestDto,
  ): Promise<IResponseData> {
    const member = await this.memberAuth.validateCredential(body)
    const auth = await this.memberAuth.login(member, {
      userIp,
      userAgent,
      userToken,
      userSession: {
        scopeType: EnumAuthScopeType.MEMBER,
        loginType: EnumAuthLoginType.CREDENTIAL,
        loginWith: EnumAuthLoginWith.PHONE,
        loginFrom: userFrom,
        loginRotate: false,
      },
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    docExclude: true,
    docExpansion: false,
    google: true,
    userAgent: true,
    userToken: true,
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
    @AuthJwtPayload<string>('user.email') email: string,
  ): Promise<IResponseData> {
    const member = await this.memberAuth.validateOAuthEmail({ email })
    const auth = await this.memberAuth.login(member, {
      userIp,
      userAgent,
      userToken,
      userSession: {
        scopeType: EnumAuthScopeType.MEMBER,
        loginType: EnumAuthLoginType.SOCIAL_GOOGLE,
        loginWith: EnumAuthLoginWith.EMAIL,
        loginFrom: userFrom,
      },
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_AUTH_OPERATION,
    docExclude: true,
    docExpansion: false,
    apple: true,
    userAgent: true,
    userToken: true,
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
    const member = await this.memberAuth.validateOAuthEmail({ email })
    const auth = await this.memberAuth.login(member, {
      userIp,
      userAgent,
      userToken,
      userSession: {
        scopeType: EnumAuthScopeType.MEMBER,
        loginType: EnumAuthLoginType.SOCIAL_APPLE,
        loginWith: EnumAuthLoginWith.EMAIL,
        loginFrom: userFrom,
      },
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
      dto: AuthResponseTokenDto,
      statusCode: HttpStatus.OK,
    },
  })
  @Post('/refresh')
  async refresh(
    @RequestUserIp() userIp: string,
    @RequestUserAgent() userAgent: IResult,
    @AuthJwtToken() refreshToken: string,
    @AuthJwtPayload('user.id') memberId: number,
  ): Promise<IResponseData> {
    const member = await this.memberAuth.getUserData(memberId)
    const auth = await this.memberAuth.refresh(member, refreshToken, {
      userIp,
      userAgent,
    })

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
    @RequestUserOTP() otp: string,
  ): Promise<IResponseData> {
    await this.memberAuth.verifyToken(otp, {
      channel: EnumVerificationChannel.SMS,
      method: EnumVerificationMethod.RESET_PASSWORD,
      phone: body.phone,
    })

    const updated = await this.memberAuth.resetPassword(body)
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
  @Post('/sign-up/request-potp')
  async requestSignUpPopt(@RequestBody() body: MemberRequestOTPDto): Promise<IResponseData> {
    const code = await this.memberAuth.sendPOPT(body.phone, {
      method: EnumVerificationMethod.SIGN_UP,
      subject: 'message.sign-up.subject',
      template: {
        fileName: 'sign-up.phone.html',
      },
      drivers: [],
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
  @Post('/sign-up/verify-potp')
  async verifySignUpPopt(
    @RequestBody() body: MemberRequestOTPDto,
    @RequestUserOTP() otp: string,
  ): Promise<IResponseData> {
    const status = await this.memberAuth.approveToken(otp, {
      channel: EnumVerificationChannel.SMS,
      method: EnumVerificationMethod.SIGN_UP,
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
  @Post('/sign-up/request-eopt')
  async requestSignUpEopt(@RequestBody() body: MemberRequestTokenDto): Promise<IResponseData> {
    const code = await this.memberAuth.sendEOPT(body.email, {
      method: EnumVerificationMethod.SIGN_UP,
      subject: 'message.sign-up.subject',
      template: {
        fileName: 'sign-up.email.html',
      },
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
  @Post('/sign-up/verify-eopt')
  async verifySignUpEopt(
    @RequestBody() body: MemberRequestTokenDto,
    @RequestUserOTT() token: string,
  ): Promise<IResponseData> {
    const status = await this.memberAuth.approveToken(token, {
      channel: EnumVerificationChannel.EMAIL,
      method: EnumVerificationMethod.SIGN_UP,
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
  @Post('/reset-password/request-potp')
  async requestResetPasswordPotp(@RequestBody() body: MemberRequestOTPDto): Promise<IResponseData> {
    const { locale } = await this.memberAuth.verifyMember({ phone: body.phone })
    const code = await this.memberAuth.sendPOPT(body.phone, {
      method: EnumVerificationMethod.RESET_PASSWORD,
      language: locale,
      subject: 'message.resetPassword.subject',
      template: {
        fileName: 'reset-password.phone.html',
      },
      drivers: [],
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
  @Post('/reset-password/verify-potp')
  async verifyResetPasswordPotp(
    @RequestBody() body: MemberRequestOTPDto,
    @RequestUserOTP() otp: string,
  ): Promise<IResponseData> {
    const status = await this.memberAuth.approveToken(otp, {
      channel: EnumVerificationChannel.SMS,
      method: EnumVerificationMethod.SIGN_UP,
      phone: body.phone,
    })
    return { data: { status } }
  }
}
