import { ApiHideProperty, ApiProperty, PickType } from '@nestjs/swagger'
import {
  APP_LANGUAGE,
  APP_TIMEZONE,
  APP_VERSION_NUMBER,
  ResponseListingMetadataDto,
  ResponseMetadataDto,
  ResponsePagingMetadataDto,
} from 'lib/nest-core'
import { REQUEST_DEFAULT_PER_PAGE } from '../constants'

export class ResponseDataDto<T = any> {
  @ApiProperty({
    name: 'success',
    type: () => Boolean,
    required: true,
    nullable: false,
    description: 'Return specific status code for every endpoints',
    example: true,
  })
  success: boolean

  @ApiProperty({
    name: 'metadata',
    isArray: false,
    required: true,
    nullable: false,
    description: 'Contain metadata about API',
    type: ResponseMetadataDto,
    additionalProperties: false,
    example: {
      language: APP_LANGUAGE,
      timestamp: 1660190937231,
      timezone: APP_TIMEZONE,
      version: APP_VERSION_NUMBER,
      path: '/api/v1/test/hello',
    },
  })
  metadata: ResponseMetadataDto

  @ApiHideProperty()
  data?: T
}

export class ResponseListingDto<T = any> extends PickType(ResponseDataDto, ['success'] as const) {
  @ApiProperty({
    name: 'metadata',
    isArray: false,
    required: true,
    nullable: false,
    description: 'Contain metadata about API',
    type: ResponseListingMetadataDto,
    example: {
      language: APP_LANGUAGE,
      timestamp: 1660190937231,
      timezone: APP_TIMEZONE,
      appVersion: APP_VERSION_NUMBER,
      path: '/api/v1/test/hello',
      availableSearch: [],
      availableOrderBy: [],
    },
  })
  metadata: ResponseListingMetadataDto

  @ApiProperty({ required: true, isArray: true, default: [] })
  data: T[]
}

export class ResponsePagingDto<T = any> extends PickType(ResponseDataDto, ['success'] as const) {
  @ApiProperty({
    name: 'metadata',
    isArray: false,
    required: true,
    nullable: false,
    description: 'Contain metadata about API',
    type: ResponsePagingMetadataDto,
    example: {
      language: APP_LANGUAGE,
      timestamp: 1660190937231,
      timezone: APP_TIMEZONE,
      version: APP_VERSION_NUMBER,
      path: '/api/v1/test/hello',
      availableSearch: [],
      availableOrderBy: [],
      pagination: {
        page: 1,
        perPage: REQUEST_DEFAULT_PER_PAGE,
        totalRecord: 100,
        totalPage: Math.round(100 / REQUEST_DEFAULT_PER_PAGE),
      },
    },
  })
  metadata: ResponsePagingMetadataDto

  @ApiProperty({ required: true, isArray: true, default: [] })
  data: T[]
}
