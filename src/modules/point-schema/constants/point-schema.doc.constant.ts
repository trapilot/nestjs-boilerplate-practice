import { ApiParamOptions, ApiQueryOptions } from '@nestjs/swagger'

export const POINT_SCHEMA_DOC_OPERATION = 'Point Schema'

export const POINT_SCHEMA_DOC_APP_QUERY_LIST: ApiQueryOptions[]  = []
export const POINT_SCHEMA_DOC_APP_PARAM_LIST: ApiParamOptions[] = []

export const POINT_SCHEMA_DOC_ADMIN_QUERY_LIST : ApiQueryOptions[] = []
export const POINT_SCHEMA_DOC_ADMIN_PARAM_DETAIL: ApiParamOptions[] = [
  {
    name: 'id',
    allowEmptyValue: false,
    required: true,
    type: 'number',
  },
]
