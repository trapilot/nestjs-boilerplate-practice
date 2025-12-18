import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import {
  applyDecorators,
  HttpCode,
  HttpStatus,
  NestInterceptor,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { RESPONSE_PASSTHROUGH_METADATA } from '@nestjs/common/constants'
import {
  ApiBearerAuth,
  ApiBody,
  ApiBodyOptions,
  ApiConsumes,
  ApiExcludeEndpoint,
  ApiExtraModels,
  ApiHeader,
  ApiHeaderOptions,
  ApiOperation,
  ApiOperationOptions,
  ApiParam,
  ApiParamOptions,
  ApiProduces,
  ApiQuery,
  ApiQueryOptions,
  ApiResponse,
  ApiSecurity,
  getSchemaPath,
} from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { ClassConstructor } from 'class-transformer'
import {
  AUTH_ACCESS_REQUIRE_METADATA,
  AUTH_ACCESS_SYNCHRONIZE_METADATA,
  AUTH_ACCESS_USER_ACTIVE_METADATA,
  AUTH_ACCESS_USER_HMAC_METADATA,
  AUTH_ACCESS_USER_UNIQUE_METADATA,
  AuthJwtAccessProtected,
  AuthJwtRefreshProtected,
  AuthUserAbilityProtected,
  AuthUserScopeProtected,
} from 'lib/nest-auth'
import {
  AppHelper,
  ENUM_FILE_DISPOSITION,
  ENUM_FILE_MIME,
  ENUM_FILE_TYPE_EXCEL,
  ENUM_GENDER_TYPE,
  FileUploadMultiple,
  FileUploadMultipleFields,
  FileUploadSingle,
  IFileUploadMultiple,
  IFileUploadMultipleField,
  IFileUploadMultipleFieldOptions,
  IFileUploadSingle,
  MESSAGE_LANGUAGES,
  MULTITENANCY_ENABLE,
  NoFilesUpload,
  TIMEZONE_LIST,
} from 'lib/nest-core'
import {
  REQUEST_DEFAULT_DOWNLOAD_TIMEOUT,
  REQUEST_DEFAULT_EXPORT_TIMEOUT,
  REQUEST_DEFAULT_PER_PAGE,
  REQUEST_TIMEOUT_METADATA,
  RESPONSE_DTO_CONSTRUCTOR_METADATA,
  RESPONSE_FILE_DISPOSITION_METADATA,
  RESPONSE_FILE_EXPORT_METADATA,
  RESPONSE_FILE_TYPE_METADATA,
} from '../constants'
import { ResponseDataDto, ResponseListingDto, ResponsePagingDto } from '../dtos'
import { ENUM_REQUEST_BODY_TYPE } from '../enums'
import { RequestSecurityGuard } from '../guards'
import {
  ResponseDataInterceptor,
  ResponseFileInterceptor,
  ResponseListingInterceptor,
  ResponsePagingInterceptor,
} from '../interceptors'
import { IRequestAuthOptions, IRequestGuardOptions } from '../interfaces'

interface IRequestOptions extends ApiOperationOptions, IRequestAuthOptions, IRequestGuardOptions {
  headers?: ApiHeaderOptions[]
  params?: ApiParamOptions[]
  queries?: ApiQueryOptions[]
  body?: { type?: ENUM_REQUEST_BODY_TYPE; dto?: ApiBodyOptions }
  file?: {
    single?: IFileUploadSingle
    multiple?: IFileUploadMultiple
    multipleFields?: {
      fields: IFileUploadMultipleField[]
      options?: IFileUploadMultipleFieldOptions
    }
  }
  docExclude?: boolean
  docExpansion?: boolean
}

interface IRequestDataOptions extends IRequestOptions {
  response?: Omit<IResponseDataOptions, 'data'>
}

interface IRequestFileOptions extends IRequestOptions {
  response: Omit<IResponseFileOptions, 'file'>
}

interface IRequestListOptions extends IRequestOptions {
  response?: Omit<IResponseListOptions, 'data' | 'exportable'>
  sortable?: boolean
  searchable?: boolean
  exportable?: boolean // Must use @Exportable() decorator for each properties that want to export
  perPage?: number
  paging: boolean
}

interface IResponseOptions {
  statusCode?: HttpStatus
  dto?: ClassConstructor<any>
  dtos?: ClassConstructor<any>
  cached?: { key: string; ttl: number } | boolean
  docExpansion?: boolean
}

interface IResponseDataOptions extends IResponseOptions {
  data: {
    type: any
    interceptor: any
  }
}

interface IResponseListOptions extends IResponseOptions {
  exportable: boolean
  exportFile?: {
    prefix?: string
    password?: string
  }
  data: {
    type: any
    interceptor: any
  }
}

interface IResponseFileOptions extends Omit<IResponseOptions, 'serializer' | 'cached'> {
  disposition: ENUM_FILE_DISPOSITION
  type?: ENUM_FILE_MIME
  file: {
    interceptor?: any
  }
}

function HttpResponse(
  options: IResponseOptions &
    Partial<IResponseDataOptions> &
    Partial<IResponseListOptions> &
    Partial<IResponseFileOptions>,
) {
  const dtos: ClassConstructor<any>[] = []
  const decorators: Array<ClassDecorator | MethodDecorator> = []
  const interceptors: NestInterceptor[] = []

  if (options?.docExpansion && options?.data?.type) {
    dtos.push(options.data.type)
    if (options?.dtos) {
      dtos.push(options.dtos)
      decorators.push(
        SetMetadata(RESPONSE_DTO_CONSTRUCTOR_METADATA, options.dtos),
        ApiResponse({
          status: HttpStatus.OK,
          schema: {
            allOf: [{ $ref: getSchemaPath(options.data.type) }],
            properties: {
              data: { type: 'array', items: { $ref: getSchemaPath(options.dtos) } },
            },
          },
        }),
      )
    } else if (options?.dto) {
      dtos.push(options.dto)
      decorators.push(
        SetMetadata(RESPONSE_DTO_CONSTRUCTOR_METADATA, options.dto),
        ApiResponse({
          status: HttpStatus.OK,
          schema: {
            allOf: [{ $ref: getSchemaPath(options.data.type) }],
            properties: {
              data: { $ref: getSchemaPath(options.dto) },
            },
          },
        }),
      )
    }
  }

  if (options?.statusCode) {
    decorators.push(HttpCode(options?.statusCode))
  }

  if (options?.cached) {
    decorators.push(UseInterceptors(CacheInterceptor))
    if (typeof options.cached !== 'boolean') {
      if (options.cached?.key) {
        decorators.push(CacheKey(options.cached?.key))
      }
      if (options?.cached?.ttl) {
        decorators.push(CacheTTL(options.cached?.ttl))
      }
    }
  }

  if (options?.exportable) {
    decorators.push(SetMetadata(RESPONSE_PASSTHROUGH_METADATA, true))
    decorators.push(SetMetadata(RESPONSE_FILE_EXPORT_METADATA, true))
  } else if (options?.file) {
    decorators.push(SetMetadata(RESPONSE_PASSTHROUGH_METADATA, true))
    decorators.push(SetMetadata(RESPONSE_FILE_TYPE_METADATA, options.type))
    decorators.push(SetMetadata(RESPONSE_FILE_DISPOSITION_METADATA, options.disposition))
  }

  if (options?.data?.interceptor) {
    interceptors.push(options.data.interceptor)
  }
  if (options?.file?.interceptor) {
    interceptors.push(options.file.interceptor)
  }

  return applyDecorators(
    ApiProduces('application/json'),
    UseInterceptors(...interceptors),
    ApiExtraModels(...dtos),
    ...decorators,
  )
}

function HttpRequest(
  options: IRequestOptions & Partial<IRequestDataOptions> & Partial<IRequestListOptions>,
) {
  const decorators: Array<ClassDecorator | MethodDecorator> = []

  decorators.push(ApiOperation(options), UseGuards(RequestSecurityGuard))

  if (options?.body) {
    const bodyType = options.body?.type
    const bodyDto = options.body?.dto

    if (bodyType === ENUM_REQUEST_BODY_TYPE.FORM_URLENCODED) {
      decorators.push(ApiConsumes('application/x-www-form-urlencoded'))
    } else if (bodyType === ENUM_REQUEST_BODY_TYPE.FORM_DATA) {
      decorators.push(ApiConsumes('multipart/form-data'))
    } else if (!options?.file) {
      if (bodyType === ENUM_REQUEST_BODY_TYPE.TEXT) {
        decorators.push(ApiConsumes('text/plain'))
      } else if (bodyType === ENUM_REQUEST_BODY_TYPE.JSON) {
        decorators.push(ApiConsumes('application/json'))
      } else {
        decorators.push(ApiConsumes('application/json'))
        decorators.push(ApiConsumes('application/x-www-form-urlencoded'))
      }
    }

    if (bodyDto) {
      decorators.push(ApiBody({ type: () => bodyDto }))
    }

    decorators.push(
      ApiResponse({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        schema: {
          allOf: [{ $ref: getSchemaPath(ResponseDataDto) }],
          properties: {
            message: { example: 'request.validation' },
            statusCode: { type: 'number', example: HttpStatus.UNPROCESSABLE_ENTITY },
          },
        },
      }),
    )
  } else if (options.file) {
    if (options.file?.multipleFields) {
      decorators.push(
        FileUploadMultipleFields(
          options.file.multipleFields.fields,
          options.file.multipleFields?.options,
        ),
      )
    } else if (options.file?.multiple) {
      decorators.push(FileUploadMultiple(options.file.multiple))
    } else if (options.file?.single) {
      decorators.push(FileUploadSingle(options.file.single))
    } else {
      decorators.push(NoFilesUpload())
    }
    decorators.push(ApiConsumes('multipart/form-data'))
  } else {
    decorators.push(ApiConsumes('application/json'))
    decorators.push(ApiConsumes('application/x-www-form-urlencoded'))
  }

  if (options?.params) {
    const params: MethodDecorator[] = options.params.map((param) => ApiParam(param))
    decorators.push(...params)
  }

  if (options?.queries) {
    const queries: MethodDecorator[] = options.queries.map((query) => ApiQuery(query))
    decorators.push(...queries)
  }

  if (options?.headers) {
    const headers: MethodDecorator[] = options.headers.map((header) => ApiHeader(header))
    decorators.push(...headers)
  }

  if ((options as IRequestListOptions)?.searchable === true) {
    decorators.push(
      ApiQuery({
        name: 'search',
        required: false,
        allowEmptyValue: true,
        type: 'string',
        description:
          'Search will base on metadata.availableSearch with rule contains, and case insensitive',
      }),
    )
  }
  if ((options as IRequestListOptions)?.paging === true) {
    decorators.push(
      ApiQuery({
        name: 'perPage',
        required: false,
        allowEmptyValue: true,
        example: (options as IRequestListOptions)?.perPage ?? REQUEST_DEFAULT_PER_PAGE,
        type: 'number',
        description: 'Data per page',
      }),
    )
    decorators.push(
      ApiQuery({
        name: 'page',
        required: false,
        allowEmptyValue: true,
        example: 1,
        type: 'number',
        description: 'Page number',
      }),
    )
  }
  if ((options as IRequestListOptions)?.sortable === true) {
    decorators.push(
      ApiQuery({
        name: 'orderBy',
        required: false,
        allowEmptyValue: true,
        example: null,
        type: 'string',
        description: 'Order by base on metadata.availableOrderBy',
      }),
    )
  }
  if ((options as IRequestListOptions)?.exportable === true) {
    decorators.push(
      ApiQuery({
        name: 'exportType',
        required: false,
        allowEmptyValue: true,
        enum: ENUM_FILE_TYPE_EXCEL,
        example: ENUM_FILE_TYPE_EXCEL.CSV,
        type: 'string',
        description: 'Export file type',
      }),
    )
  }

  if (options?.docExclude === true && !AppHelper.isDevelopment()) {
    decorators.push(ApiExcludeEndpoint())
  }

  return applyDecorators(
    ...decorators,
    DocAuth(options),
    DocGuard({
      timezone: options?.timezone ?? TIMEZONE_LIST.length > 1,
      language: options?.language ?? MESSAGE_LANGUAGES.length > 1,
      ...options,
    }),
  )
}

function DocAuth(options?: IRequestAuthOptions & { docExpansion?: boolean }) {
  const decorators: Array<ClassDecorator | MethodDecorator> = []
  const oneOf = []

  if (options?.jwtRefreshToken) {
    decorators.push(ApiBearerAuth('refreshToken'))
    decorators.push(AuthJwtRefreshProtected())
    oneOf.push({
      allOf: [{ $ref: getSchemaPath(ResponseDataDto) }],
      properties: {
        message: { example: 'auth.error.refreshTokenUnauthorized' },
        statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
      },
    })
  }

  if (options?.jwtAccessToken) {
    const jwtAccessToken = options.jwtAccessToken

    decorators.push(ApiBearerAuth('accessToken'))
    decorators.push(
      AuthJwtAccessProtected({
        guards: jwtAccessToken?.guards ?? [],
        metadata: {
          [AUTH_ACCESS_REQUIRE_METADATA]: jwtAccessToken.user.require,
          [AUTH_ACCESS_SYNCHRONIZE_METADATA]: jwtAccessToken.user.synchronize,
          [AUTH_ACCESS_USER_ACTIVE_METADATA]: jwtAccessToken.user?.active === true,
          [AUTH_ACCESS_USER_UNIQUE_METADATA]: jwtAccessToken.user?.unique === true,
          [AUTH_ACCESS_USER_HMAC_METADATA]: jwtAccessToken.user?.hmac === true,
        },
      }),
      AuthUserScopeProtected(jwtAccessToken.scope),
    )

    if (jwtAccessToken.user?.abilities) {
      decorators.push(AuthUserAbilityProtected(...jwtAccessToken.user.abilities))
    }
    if (jwtAccessToken.user?.hmac === true) {
      decorators.push(
        ApiHeader({
          name: 'x-user-hmac',
          required: true,
          // cspell:disable
          schema: { type: 'string', example: 'asdjakjsndjbasjkd' },
          // cspell:enable
        }),
      )
    }

    oneOf.push({
      allOf: [{ $ref: getSchemaPath(ResponseDataDto) }],
      properties: {
        message: { example: 'auth.error.accessTokenUnauthorized' },
        statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
      },
    })
  }

  if (options?.google) {
    decorators.push(ApiBearerAuth('google'))
    oneOf.push({
      allOf: [{ $ref: getSchemaPath(ResponseDataDto) }],
      properties: {
        message: { example: 'request.error.socialGoogle' },
        statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
      },
    })
  }

  if (options?.apple) {
    decorators.push(ApiBearerAuth('apple'))
    oneOf.push({
      allOf: [{ $ref: getSchemaPath(ResponseDataDto) }],
      properties: {
        message: { example: 'request.error.socialApple' },
        statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
      },
    })
  }

  if (options?.apiKey) {
    decorators.push(ApiSecurity('apiKey'))
    oneOf.push(
      {
        allOf: [{ $ref: getSchemaPath(ResponseDataDto) }],
        properties: {
          message: { example: 'apiKey.error.required' },
          statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
        },
      },
      {
        allOf: [{ $ref: getSchemaPath(ResponseDataDto) }],
        properties: {
          message: { example: 'apiKey.error.notFound' },
          statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
        },
      },
      {
        allOf: [{ $ref: getSchemaPath(ResponseDataDto) }],
        properties: {
          message: { example: 'apiKey.error.expired' },
          statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
        },
      },
      {
        allOf: [{ $ref: getSchemaPath(ResponseDataDto) }],
        properties: {
          message: { example: 'apiKey.error.invalid' },
          statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
        },
      },
      {
        allOf: [{ $ref: getSchemaPath(ResponseDataDto) }],
        properties: {
          message: { example: 'apiKey.error.forbidden' },
          statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
        },
      },
    )
  }

  if (MULTITENANCY_ENABLE) {
    decorators.push(
      ApiHeader({
        name: 'x-tenant-id',
        required: false,
        schema: { type: 'string' },
      }),
    )
  }

  if (options?.docExpansion === true) {
    decorators.push(
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        schema: { oneOf },
      }),
    )
  }

  return applyDecorators(...decorators)
}

function DocGuard(options?: IRequestGuardOptions & { docExpansion?: boolean }) {
  const decorators: Array<ClassDecorator | MethodDecorator> = []
  const oneOf = []

  if (options?.userOTP) {
    decorators.push(
      ApiHeader({
        name: 'x-user-otp',
        required: false,
        example: '123456',
        schema: { type: 'string' },
      }),
    )
  } else if (options?.userOTT) {
    decorators.push(
      ApiHeader({
        name: 'x-user-ott',
        required: false,
        example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
        schema: { type: 'string' },
      }),
    )
  }

  if (options?.userToken) {
    decorators.push(
      ApiHeader({
        name: 'x-user-token',
        required: false,
        schema: { type: 'string' },
      }),
    )
  }

  if (options?.userAgent) {
    decorators.push(
      ApiHeader({
        name: 'x-user-agent',
        required: false,
        schema: { type: 'string' },
      }),
    )
    oneOf.push(
      {
        allOf: [{ $ref: getSchemaPath(ResponseDataDto) }],
        properties: {
          message: { example: 'request.error.userAgentInvalid' },
          statusCode: { type: 'number', example: HttpStatus.FORBIDDEN },
        },
      },
      {
        allOf: [{ $ref: getSchemaPath(ResponseDataDto) }],
        properties: {
          message: { example: 'request.error.userAgentBrowserInvalid' },
          statusCode: { type: 'number', example: HttpStatus.FORBIDDEN },
        },
      },
      {
        allOf: [{ $ref: getSchemaPath(ResponseDataDto) }],
        properties: {
          message: { example: 'request.error.userAgentOsInvalid' },
          statusCode: { type: 'number', example: HttpStatus.FORBIDDEN },
        },
      },
    )
  }

  if (options?.userGender) {
    decorators.push(
      ApiHeader({
        name: 'x-user-gender',
        required: false,
        schema: { type: 'string', enum: Object.values(ENUM_GENDER_TYPE) },
      }),
    )
  }

  if (options?.cartVersion) {
    decorators.push(
      ApiHeader({
        name: 'x-cart-version',
        required: true,
        schema: { type: 'string', example: '1' },
      }),
    )
  }

  if (options.language) {
    decorators.push(
      ApiHeader({
        name: 'x-language',
        required: false,
        schema: { default: MESSAGE_LANGUAGES[0], type: 'string', enum: MESSAGE_LANGUAGES },
      }),
    )
  }

  if (options?.timestamp) {
    const currentTimestamp: number = new Date().valueOf()
    decorators.push(
      ApiHeader({
        name: 'x-timestamp',
        required: false,
        schema: { default: currentTimestamp, example: currentTimestamp, type: 'number' },
      }),
    )
    oneOf.push({
      allOf: [{ $ref: getSchemaPath(ResponseDataDto) }],
      properties: {
        message: { example: 'request.error.timestampInvalid' },
        statusCode: { type: 'number', example: HttpStatus.FORBIDDEN },
      },
    })
  }

  if (options?.timezone) {
    decorators.push(
      ApiHeader({
        name: 'x-timezone',
        description: 'Timezone header',
        required: false,
        schema: { default: TIMEZONE_LIST[0], type: 'string', enum: TIMEZONE_LIST },
      }),
    )
    oneOf.push({
      allOf: [{ $ref: getSchemaPath(ResponseDataDto) }],
      properties: {
        message: { example: 'request.error.timezoneInvalid' },
        statusCode: { type: 'number', example: HttpStatus.FORBIDDEN },
      },
    })
  }

  if (options?.timeLimit) {
    decorators.push(SetMetadata(REQUEST_TIMEOUT_METADATA, options.timeLimit))
  }

  if (options?.rateLimit) {
    const rateLimitWithTtl = Object.fromEntries(
      Object.entries(options.rateLimit).map(([name, config]) => [
        name,
        { ...config, ttl: config.seconds * 1000 },
      ]),
    )
    decorators.push(Throttle(rateLimitWithTtl))
  }

  if (options?.docExpansion === true) {
    decorators.push(
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        schema: { oneOf },
      }),
    )
  }

  return applyDecorators(...decorators)
}

export function ApiRequestData(options: IRequestDataOptions) {
  const { response, ...request } = options
  return applyDecorators(
    HttpRequest(request),
    HttpResponse({
      ...response,
      data: {
        type: ResponseDataDto,
        interceptor: ResponseDataInterceptor,
      },
    }),
  )
}

export function ApiRequestFile(options: IRequestFileOptions) {
  const { response, ...request } = options
  return applyDecorators(
    HttpRequest({
      timeLimit: REQUEST_DEFAULT_DOWNLOAD_TIMEOUT,
      ...request,
    }),
    HttpResponse({
      ...response,
      file: {
        interceptor: ResponseFileInterceptor,
      },
    }),
  )
}

export function ApiRequestList(options: Omit<IRequestListOptions, 'paging' | 'perPage'>) {
  const { response, ...request } = options
  const isExportable = options?.exportable === true

  return applyDecorators(
    HttpRequest({
      timeLimit: isExportable ? REQUEST_DEFAULT_EXPORT_TIMEOUT : undefined,
      ...request,
    }),
    HttpResponse({
      ...response,
      dto: undefined,
      dtos: response?.dto,
      exportable: isExportable,
      data: {
        type: ResponseListingDto,
        interceptor: ResponseListingInterceptor,
      },
    }),
  )
}

export function ApiRequestPaging(options: Omit<IRequestListOptions, 'paging'>) {
  const { response, ...request } = options
  const isExportable = options?.exportable === true

  return applyDecorators(
    HttpRequest({
      timeLimit: isExportable ? REQUEST_DEFAULT_EXPORT_TIMEOUT : undefined,
      paging: true,
      ...request,
    }),
    HttpResponse({
      data: {
        type: ResponsePagingDto,
        interceptor: ResponsePagingInterceptor,
      },
      dto: undefined,
      dtos: response?.dto,
      exportable: isExportable,
      ...response,
    }),
  )
}
