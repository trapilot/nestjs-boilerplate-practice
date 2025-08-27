export const MEMBER_DOC_OPERATION = 'Member'
export const MEMBER_DOC_AUTH_OPERATION = 'Authentication'

export const MEMBER_DOC_ADMIN_QUERY_LIST = [
  {
    name: 'phone',
    allowEmptyValue: true,
    required: false,
    type: 'string',
  },
  {
    name: 'email',
    allowEmptyValue: true,
    required: false,
    type: 'string',
  },
  {
    name: 'name',
    allowEmptyValue: true,
    required: false,
    type: 'string',
  },
  {
    name: 'isActive',
    allowEmptyValue: true,
    required: false,
    type: 'boolean',
  },
]

export const MEMBER_DOC_QUERY_APP_CHECK_IN = [
  {
    name: 'name',
    required: true,
    type: 'string',
    example: process.env.MOCK_WIFI_NAME,
  },
  {
    name: 'mac',
    required: true,
    type: 'string',
    example: process.env.MOCK_WIFI_MAC,
  },
  {
    name: 'password',
    required: true,
    type: 'string',
    example: process.env.MOCK_WIFI_PASS,
  },
]

export const MEMBER_DOC_QUERY_APP_CHECK_IN_LIST = [
  {
    name: 'year',
    required: true,
    type: 'number',
    example: new Date().getFullYear(),
  },
  {
    name: 'month',
    required: true,
    type: 'number',
    example: new Date().getMonth() + 1,
  },
]

export const MEMBER_DOC_PARAM_APP_TASK_DETAIL = [
  {
    name: 'taskId',
    required: true,
    type: 'number',
    example: 1,
  },
  {
    name: 'taskStage',
    required: true,
    type: 'number',
    example: 1,
  },
]
