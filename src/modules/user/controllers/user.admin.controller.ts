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
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums/user.enum'
import { AuthJwtPayload, AuthUtil, EnumAuthScopeType } from 'lib/nest-auth'
import {
  EnumFileExtensionDocument,
  EnumFileExtensionImage,
  FILE_SIZE_IN_BYTES,
  FileExtensionPipe,
  HelperService,
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
  RequestQuery,
  RequestQueryFilterContain,
  RequestQueryFilterInBoolean,
  RequestQueryFilterMany,
  RequestQueryList,
  RequestRequiredMonthPipe,
  RequestRequiredPipe,
  RequestRequiredYearPipe,
} from 'lib/nest-web'
import { USER_UPLOAD_IMAGE_PATH } from '../constants/users.constant'
import { USER_DOC_ADMIN_QUERY_LIST, USER_DOC_OPERATION } from '../constants/users.doc.constant'
import { UserRequestChangeAvatarDto } from '../dtos/user.request.change-avatar.dto'
import { UserRequestCreateDto } from '../dtos/user.request.create.dto'
import { UserRequestUpdateDto } from '../dtos/user.request.update.dto'
import { UserResponseDetailDto, UserResponseListDto } from '../dtos/user.response.detail.dto'
import { UserResponseLoginHistoryDto } from '../dtos/user.response.login-history.dto'
import { EnumUserActivityAction } from '../enums/user.enum'
import { UserService } from '../services/user.service'

@ApiTags(USER_DOC_OPERATION)
@Controller({ path: '/users' })
export class UserAdminController {
  constructor(
    protected readonly authUtil: AuthUtil,
    protected readonly userService: UserService,
    protected readonly helperService: HelperService,
  ) {}

  @ApiRequestPaging({
    summary: USER_DOC_OPERATION,
    queries: USER_DOC_ADMIN_QUERY_LIST,
    sortable: true,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.USER,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: UserResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryList({
      defaultPerPage: 50,
      defaultOrderBy: 'isActive:desc|id:desc',
      availableOrderBy: ['id', 'isActive'],
    })
    { _search, _kwargs }: RequestListDto,
    @RequestBookType() bookType: EnumFileExtensionDocument,
    @RequestQueryFilterMany('roleId', { parseAs: 'id' }) rawRole: RequestFilterDto,
    @RequestQueryFilterContain('phone') _phone: RequestFilterDto,
    @RequestQueryFilterContain('name') _name: RequestFilterDto,
    @RequestQueryFilterInBoolean('isActive') _enabled: RequestFilterDto,
  ): Promise<IResponsePaging> {
    const kwargs: Prisma.UserFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
        ..._enabled,
        ..._name,
        ..._phone,
        pivotRoles: rawRole,
      },
      include: {
        pivotRoles: {
          select: {
            role: {
              select: { id: true, title: true },
            },
          },
        },
      },
    }

    return await this.userService.getPage(kwargs, {
      document: bookType,
    })
  }

  @ApiRequestData({
    summary: USER_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.USER,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: UserResponseDetailDto,
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
    sortable: false,
    searchable: false,
    exportable: false,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.USER,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: UserResponseLoginHistoryDto,
    },
  })
  @Get('/:id/login-histories')
  async getLoginHistories(
    @RequestQueryList({
      defaultOrderBy: 'id:desc',
      availableOrderBy: ['id'],
    })
    { _search, _kwargs }: RequestListDto,
    @RequestBookType() bookType: EnumFileExtensionDocument,
    @RequestParam('id') id: number,
    @RequestQuery('month', { pipes: [RequestRequiredMonthPipe] }) month: number,
    @RequestQuery('year', { pipes: [RequestRequiredYearPipe] }) year: number,
  ): Promise<IResponseList> {
    const nowDate = this.helperService.dateNow()
    const reqDate = this.helperService.dateSet(nowDate, { year, month })
    const dateRange = this.helperService.dateRange(reqDate)

    const kwargs: Prisma.UserActivityFindManyArgs = {
      ..._kwargs,
      where: {
        ..._search,
        userId: id,
        action: EnumUserActivityAction.USER_LOGIN_CREDENTIAL,
        createdAt: {
          gte: dateRange.startOfMonth,
          lte: dateRange.endOfMonth,
        },
      },
    }

    return await this.userService.getActivities(kwargs, {
      document: bookType,
    })
  }

  @ApiRequestData({
    summary: USER_DOC_OPERATION,
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
        abilities: [
          {
            subject: EnumAuthAbilitySubject.USER,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: UserResponseDetailDto,
    },
  })
  @Post('/')
  async create(
    @RequestBody() body: UserRequestCreateDto,
    @UploadedFile(
      FileExtensionPipe([
        EnumFileExtensionImage.JPEG,
        EnumFileExtensionImage.JPG,
        EnumFileExtensionImage.PNG,
      ]),
    )
    file: IFile,
  ): Promise<IResponseData> {
    const { roleId, password, ...data } = body
    const { passwordHash } = this.authUtil.passwordCreate(password)
    const created = await this.userService.create(
      {
        ...data,
        password: passwordHash,
        avatar: file?.path ?? undefined,
      },
      { roleId },
    )

    return {
      data: created,
    }
  }

  @ApiRequestData({
    summary: USER_DOC_OPERATION,
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
            subject: EnumAuthAbilitySubject.USER,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: UserResponseDetailDto,
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

      const userRoles = user.pivotRoles.map(role => role.roleId)
      if (roleId && !userRoles.includes(roleId)) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'auth.error.notSelf',
        })
      }
    }

    if (data?.password) {
      const authPassword = this.authUtil.passwordCreate(data.password)
      data.password = authPassword.passwordHash
    }

    const updated = await this.userService.update(id, data, { roleId })
    return {
      data: updated,
    }
  }

  @ApiRequestData({
    summary: USER_DOC_OPERATION,
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
        abilities: [
          {
            subject: EnumAuthAbilitySubject.USER,
            actions: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: UserResponseDetailDto,
    },
  })
  @Put('/:id/change-avatar')
  async changeAvatar(
    @RequestBody() _body: UserRequestChangeAvatarDto,
    @RequestParam('id') id: number,
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
