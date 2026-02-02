import { Controller, Get, HttpStatus, Inject, Post, Put, UploadedFile } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  AuthJwtPayload,
  AuthJwtToken,
  AuthResponseLoginDto,
  AuthSocialAppleProtected,
  AuthSocialGoogleProtected,
  AuthTokenResponseDto,
  EnumAuthLoginFrom,
  EnumAuthLoginType,
  EnumAuthLoginWith,
  EnumAuthScopeType,
} from 'lib/nest-auth'
import { EnumFileExtensionImage, FILE_SIZE_IN_BYTES, FileExtensionPipe, IFile } from 'lib/nest-core'
import {
  ApiRequestData,
  IResponseData,
  RequestBody,
  RequestRequiredPipe,
  RequestUserAgent,
  RequestUserFrom,
  RequestUserIp,
  RequestUserToken,
} from 'lib/nest-web'
import { IResult } from 'ua-parser-js'
import { USER_UPLOAD_IMAGE_PATH } from '../constants/users.constant'
import { USER_DOC_AUTH_OPERATION } from '../constants/users.doc.constant'
import { UserRequestChangeAvatarDto } from '../dtos/user.request.change-avatar.dto'
import { UserRequestChangeConfirmPasswordDto } from '../dtos/user.request.change-confirm-password.dto'
import { UserRequestChangePasswordDto } from '../dtos/user.request.change-password.dto'
import { UserEditProfileRequestDto } from '../dtos/user.request.edit-profile.dto'
import { UserRequestSignInDto } from '../dtos/user.request.sign-in.dto'
import { UserRequestSignUpDto } from '../dtos/user.request.sign-up.dto'
import { UserVerifyPasswordRequestDto } from '../dtos/user.request.verify-password.dto'
import { UserProfileResponseDto } from '../dtos/user.response.profile.dto'
import { UserIsSuperAdmin } from '../guards/user.is-super-admin.guard'
import { UserAuth } from '../helpers/user.auth'

@ApiTags(USER_DOC_AUTH_OPERATION)
@Controller({ path: '/auth' })
export class UserAuthController {
  constructor(@Inject(EnumAuthScopeType.USER) protected readonly userAuth: UserAuth) {}

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
    const user = await this.userAuth.signUp(body)
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
    @RequestBody() body: UserRequestSignInDto,
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
    summary: USER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
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
    const user = await this.userAuth.getUserData(userId)
    return { data: user }
  }

  @ApiRequestData({
    summary: USER_DOC_AUTH_OPERATION,
    docExclude: true,
    docExpansion: false,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 5, seconds: 60 },
    },
    response: {
      dto: UserProfileResponseDto,
    },
  })
  @Get('/_route')
  async route(): Promise<IResponseData> {
    const user = await this.userAuth.getUserData(1)
    return { data: user }
  }

  @ApiRequestData({
    summary: USER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
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
    const profile = await this.userAuth.editProfile(userId, {
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
    summary: USER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
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
    const user = await this.userAuth.findOrFail(userId)
    const updated = await this.userAuth.changePassword(user, body)
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
      scope: EnumAuthScopeType.USER,
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
      RequestRequiredPipe,
      FileExtensionPipe([
        EnumFileExtensionImage.JPEG,
        EnumFileExtensionImage.JPG,
        EnumFileExtensionImage.PNG,
      ]),
    )
    file: IFile,
  ): Promise<IResponseData> {
    const user = await this.userAuth.findOrFail(userId)
    const updated = await this.userAuth.changeAvatar(user, {
      avatar: file.path,
    })
    return { data: updated }
  }

  @ApiRequestData({
    summary: USER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
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
    const user = await this.userAuth.getUserData(userId)
    const token = await this.userAuth.verifyConfirmPassword(user, password)
    return { data: { success: true, token } }
  }

  @ApiRequestData({
    summary: USER_DOC_AUTH_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      guards: [UserIsSuperAdmin],
      scope: EnumAuthScopeType.USER,
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
    await this.userAuth.changeConfirmPassword(body.password)

    return {
      data: { success: true },
    }
  }
}
