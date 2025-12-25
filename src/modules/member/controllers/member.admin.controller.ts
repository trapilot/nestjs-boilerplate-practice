import { Controller, Get, Post, Put, UploadedFile } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { AuthJwtPayload, AuthService, ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import { ENUM_FILE_TYPE_EXCEL, IFile } from 'lib/nest-core'
import {
  ApiRequestData,
  ApiRequestList,
  ApiRequestPaging,
  IResponseData,
  IResponseList,
  IResponsePaging,
  RequestBody,
  RequestBookType,
  RequestFileRequiredPipe,
  RequestFileTypePipe,
  RequestFilterDto,
  RequestListDto,
  RequestParam,
  RequestQueryFilterContain,
  RequestQueryFilterInBoolean,
  RequestQueryList,
} from 'lib/nest-web'
import { ENUM_APP_ABILITY_ACTION, ENUM_APP_ABILITY_SUBJECT } from 'shared/enums'
import {
  MEMBER_DOC_ADMIN_QUERY_LIST,
  MEMBER_DOC_OPERATION,
  MEMBER_UPLOAD_AVATAR_MIME,
  MEMBER_UPLOAD_IMAGE_PATH,
} from '../constants'
import {
  MemberAddPointRequestDto,
  MemberChangeAvatarRequestDto,
  MemberRequestCreateDto,
  MemberRequestUpdateDto,
  MemberResponseDetailDto,
  MemberResponseListDto,
} from '../dtos'
import { MemberService } from '../services'

@ApiTags(MEMBER_DOC_OPERATION)
@Controller({ path: '/members' })
export class MemberAdminController {
  constructor(
    protected readonly authService: AuthService,
    protected readonly memberService: MemberService,
  ) {}

  @ApiRequestPaging({
    summary: MEMBER_DOC_OPERATION,
    queries: MEMBER_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.MEMBER,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseListDto,
      docExpansion: true,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'id:desc',
      availableOrderBy: ['id'],
    })
    { _search, _params }: RequestListDto,
    @RequestBookType() bookType: ENUM_FILE_TYPE_EXCEL,
    @RequestQueryFilterContain('phone') _phone: RequestFilterDto,
    @RequestQueryFilterContain('email') _email: RequestFilterDto,
    @RequestQueryFilterContain('name') _name: RequestFilterDto,
    @RequestQueryFilterInBoolean('isActive') _enabled: RequestFilterDto,
  ): Promise<IResponsePaging> {
    const _where: Prisma.MemberWhereInput = {
      ..._search,
      ..._enabled,
      ..._phone,
      ..._email,
      ..._name,
    }
    const _include: Prisma.MemberInclude = {
      createdByUser: true,
      updatedByUser: true,
      deletedByUser: true,
      tier: true,
    }

    const pagination = await this.memberService.paginate(_where, _params, {
      bookType,
      include: _include,
    })

    return {
      ...pagination,
      filePrefix: 'members',
      fileTimestamp: true,
    }
  }

  @ApiRequestList({
    summary: MEMBER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: false,
      },
    },
    response: {
      dto: MemberResponseListDto,
      docExpansion: true,
    },
  })
  @Get('/map-shorted')
  async mapShorted(
    @RequestQueryList({
      defaultOrderBy: 'name:asc',
      availableOrderBy: ['name'],
    })
    { _search, _params }: RequestListDto,
  ): Promise<IResponseList> {
    const _where: Prisma.MemberWhereInput = {
      ..._search,
    }
    const _select: Prisma.MemberSelect = {
      id: true,
      name: true,
      phone: true,
      isActive: true,
    }

    const listing = await this.memberService.list(_where, _params, {
      select: _select,
    })

    return listing
  }

  @ApiRequestData({
    summary: MEMBER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.MEMBER,
            actions: [ENUM_APP_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseDetailDto,
      docExpansion: true,
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
    file: {
      single: {
        field: 'avatar',
        filePath: MEMBER_UPLOAD_IMAGE_PATH,
      },
    },
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.MEMBER,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseDetailDto,
      docExpansion: true,
    },
  })
  @Post('/')
  async create(
    @RequestBody() body: MemberRequestCreateDto,
    @AuthJwtPayload('user.id') createdBy: number,
    @UploadedFile(new RequestFileTypePipe(MEMBER_UPLOAD_AVATAR_MIME)) file: IFile,
  ): Promise<IResponseData> {
    const passwordHash = this.authService.createPassword(body.password)
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.MEMBER,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseDetailDto,
      docExpansion: true,
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
      const authHash = this.authService.createPassword(body.password)
      password = authHash.passwordHash
    }

    const member = await this.memberService.update(memberId, { ...body, password, updatedBy })

    return {
      data: member,
    }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.MEMBER,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id/inactive')
  async inactive(@RequestParam('id') id: number): Promise<IResponseData> {
    const member = await this.memberService.inactive(id)
    return { data: member }
  }

  @ApiRequestData({
    summary: MEMBER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.MEMBER,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id/active')
  async active(@RequestParam('id') id: number): Promise<IResponseData> {
    const member = await this.memberService.active(id)
    return { data: member }
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
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.MEMBER,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id/change-avatar')
  async update(
    @RequestBody() body: MemberChangeAvatarRequestDto,
    @RequestParam('id') memberId: number,
    @AuthJwtPayload('user.id') updatedBy: number,
    @UploadedFile(
      new RequestFileRequiredPipe('avatar'),
      new RequestFileTypePipe(MEMBER_UPLOAD_AVATAR_MIME),
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_APP_ABILITY_SUBJECT.MEMBER,
            actions: [ENUM_APP_ABILITY_ACTION.READ, ENUM_APP_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: MemberResponseDetailDto,
      docExpansion: true,
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
