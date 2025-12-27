import { Controller, Get, HttpStatus, Inject, Post, Put, UploadedFile } from '@nestjs/common'
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
import { ENUM_FILE_MIME_IMAGE, FILE_SIZE_IN_BYTES, IFile, IRequestApp } from 'lib/nest-core'
import {
  ApiRequestData,
  IResponseData,
  RequestApp,
  RequestBody,
  RequestFileRequiredPipe,
  RequestFileTypePipe,
  RequestUserAgent,
  RequestUserFrom,
  RequestUserIp,
  RequestUserToken,
} from 'lib/nest-web'
import { IResult } from 'ua-parser-js'
import { USER_DOC_AUTH_OPERATION, USER_UPLOAD_IMAGE_PATH } from '../constants'
import {
  UserEditProfileRequestDto,
  UserProfileResponseDto,
  UserRequestChangeAvatarDto,
  UserRequestChangeConfirmPasswordDto,
  UserRequestChangePasswordDto,
  UserRequestSignInDto,
  UserRequestSignUpDto,
  UserResponseLoginDto,
  UserVerifyPasswordRequestDto,
} from '../dtos'
import { UserIsSuperAdmin } from '../guards'
import { UserAuthService } from '../services'

@ApiTags(USER_DOC_AUTH_OPERATION)
@Controller({ path: '/auth' })
export class UserAuthController {
  constructor(@Inject(ENUM_AUTH_SCOPE_TYPE.USER) protected readonly authService: UserAuthService) {}

  @ApiRequestData({
    summary: USER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 10, seconds: 60 },
    },
    response: {
      dto: UserProfileResponseDto,
    },
  })
  @Post('/sign-up')
  async signUp(@RequestBody() body: UserRequestSignUpDto): Promise<IResponseData> {
    const user = await this.authService.signUp(body)
    return { data: user }
  }

  @ApiRequestData({
    summary: USER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 10, seconds: 60 },
    },
    response: {
      dto: UserResponseLoginDto,
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
    @RequestBody() body: UserRequestSignInDto,
  ): Promise<IResponseData<UserResponseLoginDto>> {
    const user = await this.authService.validateCredentials(body)
    const auth = await this.authService.login(user, userIp, userAgent, userRequest, {
      scopeType: ENUM_AUTH_SCOPE_TYPE.USER,
      loginType: ENUM_AUTH_LOGIN_TYPE.CREDENTIAL,
      loginWith: ENUM_AUTH_LOGIN_WITH.PHONE,
      loginFrom: userFrom,
      loginToken: userToken,
      loginRotate: body.rememberMe !== false,
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: USER_DOC_AUTH_OPERATION,
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
    @RequestUserFrom() userFrom: ENUM_AUTH_LOGIN_FROM,
    @RequestApp() userRequest: IRequestApp,
    @AuthJwtPayload('user.email') email: string,
  ): Promise<IResponseData> {
    const user = await this.authService.validateOAuthEmail({ email })
    const auth = await this.authService.login(user, userIp, userAgent, userRequest, {
      scopeType: ENUM_AUTH_SCOPE_TYPE.USER,
      loginType: ENUM_AUTH_LOGIN_TYPE.SOCIAL_GOOGLE,
      loginWith: ENUM_AUTH_LOGIN_WITH.EMAIL,
      loginFrom: userFrom,
      loginToken: userToken,
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: USER_DOC_AUTH_OPERATION,
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
    @RequestUserFrom() userFrom: ENUM_AUTH_LOGIN_FROM,
    @RequestApp() userRequest: IRequestApp,
    @AuthJwtPayload('user.email') email: string,
  ): Promise<IResponseData> {
    const user = await this.authService.validateOAuthEmail({ email })
    const auth = await this.authService.login(user, userIp, userAgent, userRequest, {
      scopeType: ENUM_AUTH_SCOPE_TYPE.USER,
      loginType: ENUM_AUTH_LOGIN_TYPE.SOCIAL_APPLE,
      loginWith: ENUM_AUTH_LOGIN_WITH.EMAIL,
      loginFrom: userFrom,
      loginToken: userToken,
    })
    return { data: auth }
  }

  @ApiRequestData({
    summary: USER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        active: true,
      },
    },
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 5, seconds: 60 },
    },
    response: {
      dto: UserProfileResponseDto,
    },
  })
  @Get('/_me')
  async me(@AuthJwtPayload('user.id') userId: number): Promise<IResponseData> {
    const user = await this.authService.getUserData(userId)
    return { data: user }
  }

  @ApiRequestData({
    summary: USER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
      },
    },
    response: {
      dto: UserProfileResponseDto,
    },
  })
  @Put('/edit-profile')
  async editProfile(
    @RequestBody() body: UserEditProfileRequestDto,
    @AuthJwtPayload('user.id') userId: number,
  ): Promise<IResponseData> {
    const { roleId, ...data } = body
    const profile = await this.authService.editProfile(userId, {
      ...data,
      pivotRoles: {
        deleteMany: {
          roleId: {
            not: roleId,
          },
        },
        createMany: {
          data: [{ roleId }],
          skipDuplicates: true,
        },
      },
    })
    return { data: profile }
  }

  @ApiRequestData({
    summary: USER_DOC_AUTH_OPERATION,
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
    @AuthJwtPayload('user.id') userId: number,
  ): Promise<IResponseData<AuthTokenResponseDto>> {
    const user = await this.authService.getUserData(userId)
    const auth = await this.authService.refresh(user, refreshToken, refreshPayload)

    return { data: auth }
  }

  @ApiRequestData({
    summary: USER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
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
      dto: UserProfileResponseDto,
    },
  })
  @Put('/change-password')
  async changePassword(
    @RequestBody() body: UserRequestChangePasswordDto,
    @AuthJwtPayload('user.id') userId: number,
  ): Promise<IResponseData> {
    const user = await this.authService.findOrFail(userId)
    const updated = await this.authService.changePassword(user, body)
    return { data: updated }
  }

  @ApiRequestData({
    summary: USER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    file: {
      single: {
        field: 'avatar',
        filePath: USER_UPLOAD_IMAGE_PATH,
        fileSize: FILE_SIZE_IN_BYTES,
      },
    },
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
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
      dto: UserProfileResponseDto,
    },
  })
  @Put('/change-avatar')
  async changeAvatar(
    @RequestBody() _body: UserRequestChangeAvatarDto,
    @AuthJwtPayload('user.id') userId: number,
    @UploadedFile(
      new RequestFileRequiredPipe('avatar'),
      new RequestFileTypePipe(Object.values(ENUM_FILE_MIME_IMAGE)),
    )
    file: IFile,
  ): Promise<IResponseData> {
    const user = await this.authService.findOrFail(userId)
    const updated = await this.authService.changeAvatar(user, {
      avatar: file.path,
    })
    return { data: updated }
  }

  @ApiRequestData({
    summary: USER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
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
  })
  @Post('/confirm-password')
  async confirmPassword(
    @RequestBody() { password }: UserVerifyPasswordRequestDto,
    @AuthJwtPayload('user.id') userId: number,
  ): Promise<IResponseData> {
    const user = await this.authService.getUserData(userId)
    const token = await this.authService.verifyConfirmPassword(user, password)
    return { data: { success: true, token } }
  }

  @ApiRequestData({
    summary: USER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      guards: [UserIsSuperAdmin],
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
      },
    },
    response: {},
  })
  @Post('/change-confirm-password')
  async changeConfirmPassword(
    @RequestBody() body: UserRequestChangeConfirmPasswordDto,
  ): Promise<IResponseData> {
    await this.authService.changeConfirmPassword(body.password)

    return {
      data: { success: true },
    }
  }
}
