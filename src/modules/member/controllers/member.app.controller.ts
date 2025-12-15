import { Controller, Delete, Get, Put, UploadedFile } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthJwtPayload, ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import { HelperDateService, IFile } from 'lib/nest-core'
import {
  ApiRequestData,
  IResponseData,
  RequestBody,
  RequestFileRequiredPipe,
  RequestFileTypePipe,
} from 'lib/nest-web'
import {
  MEMBER_DOC_OPERATION,
  MEMBER_UPLOAD_AVATAR_MIME,
  MEMBER_UPLOAD_IMAGE_PATH,
} from '../constants'
import {
  MemberChangePasswordRequestDto,
  MemberCloseProfileRequestDto,
  MemberEditProfileRequestDto,
  MemberProfileResponseDto,
} from '../dtos'
import { MemberService } from '../services'

@ApiTags(MEMBER_DOC_OPERATION)
@Controller({ version: '1', path: '/member' })
export class MemberAppController {
  constructor(
    protected readonly memberService: MemberService,
    protected readonly helperDateService: HelperDateService,
  ) {}

  @ApiRequestData({
    summary: MEMBER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        unique: false,
      },
    },
    response: {
      dto: MemberProfileResponseDto,
    },
  })
  @Get('/profile')
  async getProfile(@AuthJwtPayload('user.id') memberId: number): Promise<IResponseData> {
    const profile = await this.memberService.getProfile(memberId)
    return { data: profile }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        unique: false,
      },
    },
    response: {
      dto: MemberProfileResponseDto,
    },
  })
  @Put('/edit-profile')
  async editProfile(
    @RequestBody() body: MemberEditProfileRequestDto,
    @AuthJwtPayload('user.id') memberId: number,
  ): Promise<IResponseData> {
    const profile = await this.memberService.editProfile(memberId, body)

    return { data: profile }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        unique: false,
      },
    },
  })
  @Delete('/close')
  async closeProfile(
    @RequestBody() body: MemberCloseProfileRequestDto,
    @AuthJwtPayload('user.id') memberId: number,
  ): Promise<IResponseData> {
    await this.memberService.closeProfile(memberId, body.reasons)

    return { data: { id: memberId } }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_OPERATION,
    file: {
      single: {
        field: 'avatar',
        filePath: MEMBER_UPLOAD_IMAGE_PATH,
      },
    },
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        unique: false,
      },
    },
    response: {
      dto: MemberEditProfileRequestDto,
    },
  })
  @Put('upload-avatar')
  async uploadAvatar(
    @AuthJwtPayload('user.id') memberId: number,
    @UploadedFile(new RequestFileRequiredPipe(), new RequestFileTypePipe(MEMBER_UPLOAD_AVATAR_MIME))
    file: IFile,
  ): Promise<IResponseData> {
    await this.memberService.update(memberId, {
      avatar: file?.path,
    })
    const profile = await this.memberService.getProfile(memberId)
    return { data: profile }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.MEMBER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        unique: false,
      },
    },
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      medium: { limit: 5, seconds: 60 },
    },
    response: {
      dto: MemberProfileResponseDto,
    },
  })
  @Put('/change-password')
  async changePassword(
    @RequestBody() body: MemberChangePasswordRequestDto,
    @AuthJwtPayload('user.id') memberId: number,
  ): Promise<IResponseData> {
    const member = await this.memberService.findOrFail(memberId)
    const updated = await this.memberService.changePassword(member, body)
    return { data: updated }
  }
}
