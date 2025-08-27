import { BadRequestException, Controller, Get, HttpStatus, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Prisma, Setting } from '@prisma/client'
import {
  ENUM_AUTH_ABILITY_ACTION,
  ENUM_AUTH_ABILITY_SUBJECT,
  ENUM_AUTH_SCOPE_TYPE,
} from 'lib/nest-auth'
import { HelperCryptoService } from 'lib/nest-core'
import { FILE_SIZE_IN_BYTES } from 'lib/nest-file'
import { MessageService } from 'lib/nest-message'
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
  SettingRequestDto,
  SettingRequestUpdateDto,
  SettingResponseDetailDto,
  SettingResponseListDto,
  SettingTimezoneResponseDto,
} from '../dtos'
import { ENUM_SETTING_GROUP } from '../enums'
import { SettingService } from '../services'

@ApiTags(SETTING_DOC_OPERATION)
@Controller({ path: '/settings' })
export class SettingAdminController {
  constructor(
    protected readonly settingService: SettingService,
    protected readonly messageService: MessageService,
    protected readonly helperCryptoService: HelperCryptoService,
  ) {}

  @ApiRequestData({
    summary: SETTING_DOC_OPERATION,
    response: {
      dto: SettingCoreResponseDto,
    },
  })
  @Get('core')
  async getUserMaxCertificate(
    @RequestUserIp() userIp: string,
    @RequestUserAgent() userAgent: IResult,
  ): Promise<IResponseData> {
    const languages: string[] = this.messageService.getAvailableLanguages()

    const tz: string = await this.settingService.getTimezone()
    const timezoneOffset: string = await this.settingService.getTimezoneOffset()

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
        token: this.helperCryptoService.createUserToken(userIp, userAgent, true),
      },
    }
  }

  @ApiRequestData({
    summary: SETTING_DOC_OPERATION,
  })
  @Get('clean')
  async clean(): Promise<boolean> {
    return await this.settingService.cleanUp()
  }

  @ApiRequestList({
    summary: SETTING_DOC_OPERATION,
    queries: SETTING_DOC_REQUEST_LIST,
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.SETTING,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
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
    @RequestQueryFilterInEnum('group', ENUM_SETTING_GROUP) _group: RequestFilterDto,
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: false,
        require: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.SETTING,
            actions: [ENUM_AUTH_ABILITY_ACTION.READ],
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
    jwtAccessToken: {
      scope: ENUM_AUTH_SCOPE_TYPE.USER,
      user: {
        synchronize: true,
        require: true,
        active: true,
        abilities: [
          {
            subject: ENUM_AUTH_ABILITY_SUBJECT.SETTING,
            actions: [ENUM_AUTH_ABILITY_ACTION.UPDATE],
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
