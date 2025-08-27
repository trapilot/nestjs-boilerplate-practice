import { ENUM_API_KEY_TYPE } from '@prisma/client'

export const API_KEY_DOC_OPERATION = 'Api Key'

export const API_KEY_DOC_APP_QUERY_LIST = []
export const API_KEY_DOC_APP_PARAM_LIST = []

export const API_KEY_DOC_ADMIN_QUERY_LIST = [
  {
    name: 'type',
    allowEmptyValue: true,
    required: false,
    type: () => String,
    enum: ENUM_API_KEY_TYPE,
  },
  {
    name: 'isActive',
    allowEmptyValue: true,
    required: false,
    type: () => Boolean,
  },
]

export const API_KEY_DOC_ADMIN_PARAM_DETAIL = [
  {
    name: 'id',
    allowEmptyValue: false,
    required: true,
    type: () => Number,
  },
]
