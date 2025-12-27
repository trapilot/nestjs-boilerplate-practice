import { PipeTransform, Type } from '@nestjs/common'
import {
  ApiBodyOptions,
  ApiHeaderOptions,
  ApiOperationOptions,
  ApiParamOptions,
  ApiQueryOptions,
} from '@nestjs/swagger'
import { ClassConstructor } from 'class-transformer'
import { ENUM_AUTH_SCOPE_TYPE, IAuthAbility } from 'lib/nest-auth'
import {
  IFileUploadMultiple,
  IFileUploadMultipleField,
  IFileUploadMultipleFieldOptions,
  IFileUploadSingle,
  IStringParse,
} from 'lib/nest-core'
import { ENUM_REQUEST_BODY_TYPE } from '../enums'
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IRequestFilterDateOptions extends IRequestFilterOptions {}

export interface IRequestFilterEqualOptions extends IRequestFilterOptions {
  parseAs?: 'number' | 'string' | 'id'
}

export interface IRequestFilterEnumOptions extends IRequestFilterOptions {
  defaultValue?: any
}

export interface IRequestMetricsConfig {
  defaultLabels?: Record<string, string>
  defaultMetricsEnabled?: boolean
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

export interface IRequestAuthOptions {
  apiKey?: boolean
  google?: boolean
  apple?: boolean
  jwtRefreshToken?: boolean
  jwtAccessToken?: {
    guards?: ClassConstructor<any>[]
    scope: ENUM_AUTH_SCOPE_TYPE
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
  userAgent?: boolean
  userToken?: boolean
  userGender?: boolean
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
  body?: { type?: ENUM_REQUEST_BODY_TYPE; dto?: ApiBodyOptions }
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
