export class ResponseMessageErrorDto {
  property: string
  message: string
}

export class ResponseMetadataDto {
  language: string
  timestamp: number
  timezone: string
  version: string
  path: string;
  [key: string]: any
}

export class ResponseListingMetadataDto extends ResponseMetadataDto {
  availableSearch: string[]
  availableOrderBy: string[]
}

export class ResponsePagingMetadataDto extends ResponseMetadataDto {
  pagination: {
    page: number
    perPage: number
    totalRecord: number
    totalPage: number
  }
}

export class ResponseSuccessDto<T = any> {
  success: boolean
  metadata: ResponseMetadataDto
  result: T
}

export class ResponseErrorDto {
  success: boolean
  metadata: ResponseMetadataDto
  error: {
    message: string
    code: string | number
    details?: ResponseMessageErrorDto[]
    error?: string // Error message for debugging
  }
}
