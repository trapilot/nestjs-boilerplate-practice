import { PipeTransform, Type } from '@nestjs/common'
import { RouteInfo } from '@nestjs/common/interfaces'
import {
  ApiBodyOptions,
  ApiHeaderOptions,
  ApiOperationOptions,
  ApiParamOptions,
  ApiQueryOptions,
} from '@nestjs/swagger'
import { ClassConstructor } from 'class-transformer'
import { EnumAuthScopeType, IAuthAbility } from 'lib/nest-auth'
import {
  IFileUploadMultiple,
  IFileUploadMultipleField,
  IFileUploadMultipleFieldOptions,
  IFileUploadSingle,
  IStringParse,
} from 'lib/nest-core'
import { EnumRequestBodyType } from '../enums'
import {
  IResponseDataOptions,
  IResponseFileOptions,
  IResponseListOptions,
} from './response.interface'

export interface IRequestRateLimitOptions {
  limit: number
  seconds: number
  blockDuration?: number
}

export interface IRequestQueryListOptions {
  defaultPerPage?: number
  defaultOrderBy?: string
  availableSearch?: string[]
  availableOrderBy?: string[]
}

export interface IRequestFilterOptions {
  queryField?: string
  raw?: boolean
}

export interface IRequestFilterParseOptions extends Pick<IRequestFilterOptions, 'raw'> {
  parseAs?: IStringParse
  pipes?: (Type<PipeTransform> | PipeTransform)[]
}

export interface IRequestFilterDateOptions extends IRequestFilterOptions {}

export interface IRequestFilterEqualOptions extends IRequestFilterOptions {
  parseAs?: 'number' | 'string' | 'id'
}

export interface IRequestFilterEnumOptions extends IRequestFilterOptions {
  defaultValue?: any
}

export interface IRequestMetricsOptions {
  defaultLabels: Record<string, string>
  defaultMetricsEnabled: boolean
  interceptors?: Type<any>[]
  pushgatewayUrl?: string
  pushgatewayOptions?: {
    timeout?: number
    headers?: Record<string, string>
    auth?: {
      username: string
      password: string
    }
  }
}

export interface IRequestLoggerOptions {
  autoLogging: boolean
  applyRoutes?: RouteInfo[]
  excludeRoutes?: RouteInfo[]
}

export interface IRequestAuthOptions {
  apiKey?: boolean
  google?: boolean
  apple?: boolean
  jwtRefreshToken?: boolean
  jwtAccessToken?: {
    guards?: ClassConstructor<any>[]
    scope: EnumAuthScopeType
    user: {
      synchronize: boolean
      require: boolean
      active?: boolean
      unique?: boolean
      hmac?: boolean
      abilities?: IAuthAbility[]
    }
  }
}

export interface IRequestGuardOptions {
  userOTP?: boolean
  userOTT?: boolean
  userType?: boolean
  userAgent?: boolean
  userToken?: boolean
  cartVersion?: boolean
  language?: boolean
  timezone?: boolean
  timestamp?: boolean
  timeLimit?: number
  rateLimit?: {
    default?: IRequestRateLimitOptions
    short?: IRequestRateLimitOptions
    medium?: IRequestRateLimitOptions
    long?: IRequestRateLimitOptions
  }
}

export interface IRequestOptions
  extends ApiOperationOptions,
    IRequestAuthOptions,
    IRequestGuardOptions {
  headers?: ApiHeaderOptions[]
  params?: ApiParamOptions[]
  queries?: ApiQueryOptions[]
  body?: { type?: EnumRequestBodyType; dto?: ApiBodyOptions }
  file?: {
    single?: IFileUploadSingle
    multiple?: IFileUploadMultiple
    multipleFields?: {
      fields: IFileUploadMultipleField[]
      options?: IFileUploadMultipleFieldOptions
    }
  }
  docExclude: boolean
  docExpansion: boolean
}

export interface IRequestDataOptions extends IRequestOptions {
  response?: Omit<IResponseDataOptions, 'data'>
}

export interface IRequestFileOptions extends IRequestOptions {
  response: Omit<IResponseFileOptions, 'file'>
}

export interface IRequestListOptions extends IRequestOptions {
  response?: Omit<IResponseListOptions, 'data' | 'exportable'>
  sortable: boolean
  searchable: boolean
  exportable: boolean // Use @Exportable() decorator for each properties that want to export
  perPage?: number
  paging: boolean
}
