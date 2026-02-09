import { Controller, Get, Post, Put, UploadedFile } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums/user.enum'
import { AuthJwtPayload, AuthUtil, EnumAuthScopeType } from 'lib/nest-auth'
import {
  EnumFileExtensionDocument,
  EnumFileExtensionImage,
  FileExtensionPipe,
  IFile,
} from 'lib/nest-core'
import {
  ApiRequestData,
  ApiRequestList,
  ApiRequestPaging,
  IResponseData,
  IResponseList,
  IResponsePaging,
  RequestBody,
  RequestBookType,
  RequestFilterDto,
  RequestListDto,
  RequestParam,
  RequestQueryFilterContain,
  RequestQueryFilterInBoolean,
  RequestQueryList,
  RequestRequiredPipe,
} from 'lib/nest-web'
import { MEMBER_UPLOAD_IMAGE_PATH } from '../constants/member.constant'
import { MEMBER_DOC_ADMIN_QUERY_LIST, MEMBER_DOC_OPERATION } from '../constants/member.doc.constant'
import { MemberAddPointRequestDto } from '../dtos/member.request.add-point.dto'
import { MemberChangeAvatarRequestDto } from '../dtos/member.request.change-avatar.dto'
import { MemberRequestCreateDto } from '../dtos/member.request.create.dto'
import { MemberRequestUpdateDto } from '../dtos/member.request.update.dto'
import { MemberResponseDetailDto, MemberResponseListDto } from '../dtos/member.response.detail.dto'
import { MemberService } from '../services/member.service'

@ApiTags(MEMBER_DOC_OPERATION)
@Controller({ path: '/members' })
export class MemberAdminController {
  constructor(
    protected readonly authUtil: AuthUtil,
    protected readonly memberService: MemberService,
  ) {}

  @ApiRequestPaging({
    summary: MEMBER_DOC_OPERATION,
    queries: MEMBER_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    searchable: false,
    exportable: true,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.MEMBER,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'id:desc',
      availableOrderBy: ['id'],
    })
    { _search, _kwargs }: RequestListDto,
    @RequestBookType() bookType: EnumFileExtensionDocument,
    @RequestQueryFilterContain('phone') _phone: RequestFilterDto,
    @RequestQueryFilterContain('email') _email: RequestFilterDto,
    @RequestQueryFilterContain('name') _name: RequestFilterDto,
    @RequestQueryFilterInBoolean('isActive') _enabled: RequestFilterDto,
  ): Promise<IResponsePaging> {
    const kwargs: Prisma.MemberFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
        ..._enabled,
        ..._phone,
        ..._email,
        ..._name,
      },
      include: {
        createdByUser: true,
        updatedByUser: true,
        deletedByUser: true,
        tier: true,
      },
    }

    return await this.memberService.getPage(kwargs, {
      document: bookType,
      filePrefix: 'members',
      fileTimestamp: true,
    })
  }

  @ApiRequestList({
    summary: MEMBER_DOC_OPERATION,
    sortable: false,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: MemberResponseListDto,
    },
  })
  @Get('/map-shorted')
  async mapShorted(
    @RequestQueryList({
      defaultOrderBy: 'name:asc',
      availableOrderBy: ['name'],
    })
    { _search, _kwargs }: RequestListDto,
  ): Promise<IResponseList> {
    return await this.memberService.getList({
      ..._kwargs,
      where: { ..._search },
      select: { id: true },
    })
  }

  @ApiRequestData({
    summary: MEMBER_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.MEMBER,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseDetailDto,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const member = await this.memberService.findOrFail(id, {
      include: {
        createdByUser: true,
        updatedByUser: true,
        deletedByUser: true,
        tier: true,
      },
    })

    return {
      data: member,
    }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    file: {
      single: {
        field: 'avatar',
        filePath: MEMBER_UPLOAD_IMAGE_PATH,
      },
    },
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.MEMBER,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseDetailDto,
    },
  })
  @Post('/')
  async create(
    @RequestBody() body: MemberRequestCreateDto,
    @AuthJwtPayload('user.id') createdBy: number,
    @UploadedFile(
      FileExtensionPipe([
        EnumFileExtensionImage.JPEG,
        EnumFileExtensionImage.JPG,
        EnumFileExtensionImage.PNG,
      ]),
    )
    file: IFile,
  ): Promise<IResponseData> {
    const passwordHash = this.authUtil.passwordCreate(body.password)
    const member = await this.memberService.create(
      { ...body, avatar: file?.path ?? undefined, createdBy },
      passwordHash,
    )

    return {
      data: member,
    }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.MEMBER,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseDetailDto,
    },
  })
  @Put('/:id')
  async put(
    @RequestBody() body: MemberRequestUpdateDto,
    @RequestParam('id') memberId: number,
    @AuthJwtPayload('user.id') updatedBy: number,
  ): Promise<IResponseData> {
    let password = undefined
    if (body?.password) {
      const { passwordHash } = this.authUtil.passwordCreate(body.password)
      password = passwordHash
    }

    const member = await this.memberService.update(memberId, {
      ...body,
      password,
      updatedBy,
    })

    return {
      data: member,
    }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.MEMBER,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseDetailDto,
    },
  })
  @Put('/:id/inactive')
  async inactive(@RequestParam('id') id: number): Promise<IResponseData> {
    const member = await this.memberService.inactive(id)
    return { data: member }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.MEMBER,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseDetailDto,
    },
  })
  @Put('/:id/active')
  async active(@RequestParam('id') id: number): Promise<IResponseData> {
    const member = await this.memberService.active(id)
    return { data: member }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    file: {
      single: {
        field: 'avatar',
        filePath: MEMBER_UPLOAD_IMAGE_PATH,
      },
    },
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.MEMBER,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseDetailDto,
    },
  })
  @Put('/:id/change-avatar')
  async update(
    @RequestBody() _body: MemberChangeAvatarRequestDto,
    @RequestParam('id') memberId: number,
    @AuthJwtPayload('user.id') updatedBy: number,
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
    const member = await this.memberService.findOrFail(memberId)
    const updated = await this.memberService.changeAvatar(member, {
      avatar: file?.path ?? undefined,
      updatedBy,
    })

    return {
      data: updated,
    }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.MEMBER,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseDetailDto,
    },
  })
  @Post('/:id/points')
  async addPoint(
    @RequestBody() body: MemberAddPointRequestDto,
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') createdBy: number,
  ): Promise<IResponseData> {
    const member = await this.memberService.addPoint(id, {
      point: body.point,
      createdBy,
    })

    return { data: member }
  }
}
