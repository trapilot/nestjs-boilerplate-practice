export const PUSH_DOC_OPERATION = 'Push'

export const PUSH_DOC_APP_QUERY_LIST = []
export const PUSH_DOC_APP_PARAM_LIST = []

export const PUSH_DOC_ADMIN_QUERY_LIST = []
export const PUSH_DOC_ADMIN_PARAM_DETAIL = [
  {
    name: 'id',
    allowEmptyValue: false,
    required: true,
    type: () => Number,
  },
]
