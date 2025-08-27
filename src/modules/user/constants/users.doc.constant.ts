export const USER_DOC_OPERATION = 'User'
export const USER_DOC_AUTH_OPERATION = 'Authentication'

export const USER_DOC_ADMIN_QUERY_LIST = [
  {
    name: 'isActive',
    allowEmptyValue: false,
    required: false,
    type: 'string',
    enum: ['true', 'false'],
    example: 'true',
    description: 'boolean value',
  },
  {
    name: 'name',
    allowEmptyValue: true,
    required: false,
    type: 'string',
  },
  {
    name: 'phone',
    allowEmptyValue: true,
    required: false,
    type: 'string',
  },
  {
    name: 'roleId',
    allowEmptyValue: true,
    required: false,
    type: 'number',
  },
]
