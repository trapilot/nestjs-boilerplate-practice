export const POINT_HISTORY_DOC_OPERATION = 'Point History'

export const POINT_HISTORY_DOC_APP_QUERY_LIST = []
export const POINT_HISTORY_DOC_APP_PARAM_LIST = []

export const POINT_HISTORY_DOC_ADMIN_QUERY_LIST = [
  {
    name: 'memberCode',
    allowEmptyValue: true,
    required: false,
    type: () => String,
  },
]
export const POINT_HISTORY_DOC_ADMIN_PARAM_DETAIL = [
  {
    name: 'id',
    allowEmptyValue: false,
    required: true,
    type: () => Number,
  },
]
