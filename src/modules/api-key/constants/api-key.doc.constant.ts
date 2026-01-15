import { EnumApiKeyType } from '@runtime/prisma-client'

export const API_KEY_DOC_OPERATION = 'Api Key'

export const API_KEY_DOC_APP_QUERY_LIST = []
export const API_KEY_DOC_APP_PARAM_LIST = []

export const API_KEY_DOC_ADMIN_QUERY_LIST = [
  {
    name: 'type',
    allowEmptyValue: true,
    required: false,
    enum: EnumApiKeyType,
  },
  {
    name: 'isActive',
    allowEmptyValue: true,
    required: false,
    type: 'boolean',
  },
]

export const API_KEY_DOC_ADMIN_PARAM_DETAIL = [
  {
    name: 'id',
    allowEmptyValue: false,
    required: true,
    type: 'number',
  },
]
