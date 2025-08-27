export const DASHBOARD_DOC_OPERATION = 'Dashboard'

export const DASHBOARD_DOC_APP_QUERY_LIST = []
export const DASHBOARD_DOC_APP_PARAM_LIST = []

export const DASHBOARD_DOC_ADMIN_QUERY_LIST = []
export const DASHBOARD_DOC_ADMIN_PARAM_DETAIL = [
  {
    name: 'id',
    allowEmptyValue: false,
    required: true,
    type: () => Number,
    example: 1,
  },
]
