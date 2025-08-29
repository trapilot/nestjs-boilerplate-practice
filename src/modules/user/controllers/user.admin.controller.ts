import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  UploadedFile,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import {
  AuthJwtPayload,
  AuthService,
  ENUM_AUTH_ABILITY_ACTION,
  ENUM_AUTH_ABILITY_SUBJECT,
  ENUM_AUTH_SCOPE_TYPE,
} from 'lib/nest-auth'
import {
  ENUM_FILE_MIME,
  ENUM_FILE_TYPE_EXCEL,
  FILE_SIZE_IN_BYTES,
  FileRequiredPipe,
  FileTypePipe,
  IFile,
} from 'lib/nest-file'
import { HelperDateService } from 'lib/nest-core'
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
  RequestQuery,
  RequestQueryFilterContain,
  RequestQueryFilterInBoolean,
  RequestQueryFilterMany,
  RequestQueryList,
  RequestRequiredMonthPipe,
  RequestRequiredYearPipe,
} from 'lib/nest-web'
import { USER_DOC_ADMIN_QUERY_LIST, USER_DOC_OPERATION, USER_UPLOAD_IMAGE_PATH } from '../constants'
import {
  UserRequestChangeAvatarDto,
  UserRequestCreateDto,
  UserRequestUpdateDto,
  UserResponseDetailDto,
  UserResponseListDto,
  UserResponseLoginHistoryDto,
} from '../dtos'
import { UserService } from '../services'

@ApiTags(USER_DOC_OPERATION)
@Controller({ path: '/users' })
export class UserAdminController {
  constructor(
    protected readonly authService: AuthService,
    protected readonly userService: UserService,
    protected readonly helperDateService: HelperDateService,
  ) {}

  @ApiRequestPaging({
    summary: USER_DOC_OPERATION,
    queries: USER_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.USER,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: UserResponseListDto,
      docExpansion: true,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'isActive:desc|id:desc',
      availableOrderBy: ['id', 'isActive'],
    })
    { _search, _params }: RequestListDto,
    @RequestBookType() bookType: ENUM_FILE_TYPE_EXCEL,
    @RequestQueryFilterMany('roleId', { parseAs: 'id' }) rawRole: RequestFilterDto,
    @RequestQueryFilterContain('phone') _phone: RequestFilterDto,
    @RequestQueryFilterContain('name') _name: RequestFilterDto,
    @RequestQueryFilterInBoolean('isActive') _enabled: RequestFilterDto,
  ): Promise<IResponsePaging> {
    const _where: Prisma.UserWhereInput = {
      ..._search,
      ..._enabled,
      ..._name,
      ..._phone,
      pivotRoles: rawRole,
    }
    const _include: Prisma.UserInclude = {
      pivotRoles: {
        select: {
          role: {
            select: { id: true, title: true },
          },
        },
      },
    }

    const pagination = await this.userService.paginate(_where, _params, {
      bookType,
      include: _include,
    })
    return pagination
  }

  @ApiRequestData({
    summary: USER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.USER,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: UserResponseDetailDto,
      docExpansion: true,
    },
  })
  @Get('/:id')
  async get(@RequestParam('id') id: number): Promise<IResponseData> {
    const user = await this.userService.findOrFail(id, {
      include: {
        pivotRoles: {
          select: {
            role: {
              select: { id: true, title: true },
            },
          },
        },
      },
    })
    return { data: user }
  }

  @ApiRequestList({
    summary: USER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.USER,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
          },
        ],
      },
    },
    response: {
      dto: UserResponseLoginHistoryDto,
      docExpansion: true,
    },
  })
  @Get('/:id/login-histories')
  async getLoginHistories(
    @RequestQueryList({
      defaultOrderBy: 'id:desc',
      availableOrderBy: ['id'],
    })
    { _search, _params }: RequestListDto,
    @RequestBookType() bookType: ENUM_FILE_TYPE_EXCEL,
    @RequestParam('id') id: number,
    @RequestQuery('month', { pipes: [RequestRequiredMonthPipe] }) month: number,
    @RequestQuery('year', { pipes: [RequestRequiredYearPipe] }) year: number,
  ): Promise<IResponseList> {
    const dateNow = this.helperDateService.create()
    const dateReq = this.helperDateService.set(dateNow, { year, month })
    const dates = this.helperDateService.createRange(dateReq)

    const _where: Prisma.UserLoginHistoryWhereInput = {
      ..._search,
      userId: id,
      loginDate: {
        gte: dates.startOfMonth,
        lte: dates.endOfMonth,
      },
    }

    const listing = await this.userService.getLoginHistories(_where, _params, {
      bookType,
    })
    return listing
  }

  @ApiRequestData({
    summary: USER_DOC_OPERATION,
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
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.USER,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.CREATE],
          },
        ],
      },
    },
    response: {
      dto: UserResponseDetailDto,
      docExpansion: true,
    },
  })
  @Post('/')
  async create(
    @RequestBody() body: UserRequestCreateDto,
    @UploadedFile(new FileTypePipe([ENUM_FILE_MIME.JPEG, ENUM_FILE_MIME.JPG, ENUM_FILE_MIME.PNG]))
    file: IFile,
  ): Promise<IResponseData> {
    const { roleId, ...data } = body
    const authPassword = this.authService.createPassword(body.password)
    const created = await this.userService.create(
      { ...data, avatar: file?.path ?? undefined },
      authPassword,
      { roleId },
    )

    return {
      data: created,
    }
  }

  @ApiRequestData({
    summary: USER_DOC_OPERATION,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.USER,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: UserResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id')
  async update(
    @RequestParam('id') id: number,
    @RequestBody() body: UserRequestUpdateDto,
    @AuthJwtPayload('user.id') userId: number,
  ): Promise<IResponseData> {
    const { roleId, ...data } = body

    if (userId === id) {
      const user = await this.userService.findOrFail(id, {
        include: { pivotRoles: true },
      })

      if (user.isActive && user.isActive !== data.isActive) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'auth.error.notSelf',
        })
      }

      const userRoles = user.pivotRoles.map((role) => role.roleId)
      if (roleId && !userRoles.includes(roleId)) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'auth.error.notSelf',
        })
      }
    }

    if (data?.password) {
      const authPassword = this.authService.createPassword(data.password)
      data.password = authPassword.passwordHash
    }

    const updated = await this.userService.update(id, data, { roleId })
    return {
      data: updated,
    }
  }

  @ApiRequestData({
    summary: USER_DOC_OPERATION,
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
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.USER,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ, ENUM_AUTH_ABILITY_ACTION.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: UserResponseDetailDto,
      docExpansion: true,
    },
  })
  @Put('/:id/change-avatar')
  async changeAvatar(
    @RequestBody() body: UserRequestChangeAvatarDto,
    @RequestParam('id') id: number,
    @AuthJwtPayload('user.id') updatedBy: number,
    @UploadedFile(
      new FileRequiredPipe('avatar'),
      new FileTypePipe([ENUM_FILE_MIME.JPEG, ENUM_FILE_MIME.JPG, ENUM_FILE_MIME.PNG]),
    )
    file: IFile,
  ): Promise<IResponseData> {
    const user = await this.userService.findOrFail(id)
    const updated = await this.userService.changeAvatar(user, {
      avatar: file?.path ?? undefined,
      updatedBy,
    })

    return {
      data: updated,
    }
  }
}
