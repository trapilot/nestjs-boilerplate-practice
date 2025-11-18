import { ExecutionContext, PipeTransform, Type } from '@nestjs/common'
import { ApiHeaderOptions, ApiParamOptions, ApiQueryOptions } from '@nestjs/swagger'
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

export interface IRequestRateLimitOptions {
  limit?: number
  ttl?: number
  blockDuration?: number
  getTracker?: (req: Record<string, any>) => Promise<string> | string
  generateKey?: (context: ExecutionContext, trackerString: string, throttlerName: string) => string
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

export interface IRequestDocOptions {
  operation?: string
  summary?: string
  deprecated?: boolean
  description?: string
  docExclude?: boolean
  docExpansion?: boolean
}

export interface IRequestOptions
  extends IRequestDocOptions,
    IRequestAuthOptions,
    IRequestGuardOptions {
  headers?: ApiHeaderOptions[]
  params?: ApiParamOptions[]
  queries?: ApiQueryOptions[]
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  body?: { type?: ENUM_REQUEST_BODY_TYPE; dto?: Function }
}

export interface IRequestListOptions extends IRequestOptions {
  sortable?: boolean
  searchable?: boolean
}

export interface IRequestPagingOptions extends IRequestListOptions {
  perPage?: number
}

export interface IRequestFileOptions extends IRequestPagingOptions {
  file: {
    single?: IFileUploadSingle
    multiple?: IFileUploadMultiple
    multipleFields?: {
      fields: IFileUploadMultipleField[]
      options?: IFileUploadMultipleFieldOptions
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
  timeout?: number
  timezone?: boolean
  timestamp?: boolean
  rateLimit?: Record<string, IRequestRateLimitOptions>
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
