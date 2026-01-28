import { BadRequestException, Controller, Get, HttpStatus, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma, Setting } from '@runtime/prisma-client'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums'
import { EnumAuthScopeType } from 'lib/nest-auth'
import { FILE_SIZE_IN_BYTES, HelperService, MessageService } from 'lib/nest-core'
import {
  ApiRequestData,
  ApiRequestList,
  IResponseData,
  IResponseList,
  RequestBody,
  RequestFilterDto,
  RequestParamGuard,
  RequestQueryFilterInEnum,
  RequestUserAgent,
  RequestUserIp,
} from 'lib/nest-web'
import { IResult } from 'ua-parser-js'
import {
  SETTING_DOC_OPERATION,
  SETTING_DOC_REQUEST_LIST,
  SETTING_DOC_REQUEST_PARAMS,
} from '../constants'
import { GetSetting, SettingAdminUpdateGuard } from '../decorators'
import {
  SettingCoreResponseDto,
  SettingFileResponseDto,
  SettingRequestCreateDto,
  SettingRequestDto,
  SettingRequestUpdateDto,
  SettingResponseDetailDto,
  SettingResponseListDto,
  SettingTimezoneResponseDto,
} from '../dtos'
import { EnumSettingGroup } from '../enums'
import { SettingService } from '../services'

@ApiTags(SETTING_DOC_OPERATION)
@Controller({ path: '/settings' })
export class SettingAdminController {
  constructor(
    protected readonly message: MessageService,
    protected readonly helperService: HelperService,
    protected readonly settingService: SettingService,
  ) {}

  @ApiRequestData({
    summary: SETTING_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
    response: {
      dto: SettingCoreResponseDto,
    },
  })
  @Get('core')
  async getUserMaxCertificate(
    @RequestUserIp() userIp: string,
    @RequestUserAgent() userAgent: IResult,
  ): Promise<IResponseData> {
    const languages: string[] = this.message.getAvailableLanguages()

    const tz: string = this.settingService.getTimezone()
    const timezoneOffset: string = this.settingService.getTimezoneOffset()

    const timezone: SettingTimezoneResponseDto = {
      timezone: tz,
      timezoneOffset: timezoneOffset,
    }

    const file: SettingFileResponseDto = {
      sizeInBytes: FILE_SIZE_IN_BYTES,
    }

    return {
      data: {
        languages,
        file,
        timezone,
        token: this.helperService.createUserToken(userIp, userAgent, true),
      },
    }
  }

  @ApiRequestData({
    summary: SETTING_DOC_OPERATION,
    docExclude: false,
    docExpansion: false,
  })
  @Get('clean')
  async cleanCache(): Promise<boolean> {
    return await this.settingService.clearAllCache()
  }

  @ApiRequestList({
    summary: SETTING_DOC_OPERATION,
    queries: SETTING_DOC_REQUEST_LIST,
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
            subject: EnumAuthAbilitySubject.SETTING,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: SettingResponseListDto,
    },
  })
  @Get('/')
  async list(
    @RequestQueryFilterInEnum('group', EnumSettingGroup) _group: RequestFilterDto,
  ): Promise<IResponseList> {
    const where: Prisma.SettingWhereInput = {
      ..._group,
      isVisible: true,
    }
    const settings = await this.settingService.findAll(where)
    return { data: settings }
  }

  @ApiRequestData({
    summary: SETTING_DOC_OPERATION,
    params: SETTING_DOC_REQUEST_PARAMS,
    docExclude: false,
    docExpansion: false,
    jwtAccessToken: {
      scope: EnumAuthScopeType.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: EnumAuthAbilitySubject.SETTING,
            actions: [EnumAuthAbilityAction.READ],
          },
        ],
      },
    },
    response: {
      dto: SettingResponseDetailDto,
    },
  })
  @SettingAdminUpdateGuard()
  @RequestParamGuard(SettingRequestDto)
  @Get(':id')
  async get(@GetSetting() setting: Setting): Promise<IResponseData> {
    return { data: setting }
  }

  @ApiRequestData({
    summary: SETTING_DOC_OPERATION,
    params: SETTING_DOC_REQUEST_PARAMS,
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
            subject: EnumAuthAbilitySubject.SETTING,
            actions: [EnumAuthAbilityAction.CREATE],
          },
        ],
      },
    },
    response: {
      dto: SettingResponseDetailDto,
    },
  })
  @Post('/')
  async create(@RequestBody() body: SettingRequestCreateDto): Promise<IResponseData> {
    const check = this.settingService.checkValue(body.value, body.type)
    if (!check) {
      throw new BadRequestException({
        statusCode: HttpStatus.NOT_ACCEPTABLE,
        message: 'module.setting.valueNotAllowed',
      })
    }

    const setting = await this.settingService.create(body)

    return { data: setting }
  }

  @ApiRequestData({
    summary: SETTING_DOC_OPERATION,
    params: SETTING_DOC_REQUEST_PARAMS,
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
            subject: EnumAuthAbilitySubject.SETTING,
            actions: [EnumAuthAbilityAction.UPDATE],
          },
        ],
      },
    },
    response: {
      dto: SettingResponseDetailDto,
    },
  })
  @SettingAdminUpdateGuard()
  @RequestParamGuard(SettingRequestDto)
  @Put('/:id')
  async update(
    @RequestBody() body: SettingRequestUpdateDto,
    @GetSetting() setting: Setting,
  ): Promise<IResponseData> {
    const check = this.settingService.checkValue(body.value, setting.type)
    if (!check) {
      throw new BadRequestException({
        statusCode: HttpStatus.NOT_ACCEPTABLE,
        message: 'module.setting.valueNotAllowed',
      })
    }

    setting = await this.settingService.update(setting.id, body)

    return { data: setting }
  }
}
