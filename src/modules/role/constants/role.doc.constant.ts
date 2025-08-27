export const ROLE_DOC_OPERATION = 'Role'

export const ROLE_DOC_APP_QUERY_LIST = []
export const ROLE_DOC_APP_PARAM_LIST = []

export const ROLE_DOC_ADMIN_QUERY_LIST = [
  {
    name: 'isActive',
    allowEmptyValue: true,
    required: false,
    type: () => Boolean,
  },
]
export const ROLE_DOC_ADMIN_PARAM_DETAIL = [
  {
    name: 'id',
    allowEmptyValue: false,
    required: true,
    type: () => Number,
  },
]
