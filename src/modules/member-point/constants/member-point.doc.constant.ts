export const MEMBER_POINT_DOC_OPERATION = 'Member Point'

export const MEMBER_POINT_DOC_APP_QUERY_LIST = []
export const MEMBER_POINT_DOC_APP_PARAM_LIST = []

export const MEMBER_POINT_DOC_ADMIN_QUERY_LIST = [
  {
    name: 'memberCode',
    allowEmptyValue: true,
    required: false,
    type: 'string',
  },
]
export const MEMBER_POINT_DOC_ADMIN_PARAM_DETAIL = [
  {
    name: 'id',
    allowEmptyValue: false,
    required: true,
    type: 'number',
  },
]
