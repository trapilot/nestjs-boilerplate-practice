import { ApiParamOptions, ApiQueryOptions } from '@nestjs/swagger'

<% if (auth) { %>export const <%= singular(uppercased(name)) %>_DOC_OPERATION = '<%= named(name) %>'
export const <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION = 'Authentication'<% } else { %>export const <%= singular(uppercased(name)) %>_DOC_OPERATION = '<%= named(name) %>'<% } %>

export const <%= singular(uppercased(name)) %>_DOC_APP_QUERY_LIST: ApiQueryOptions[]  = []
export const <%= singular(uppercased(name)) %>_DOC_APP_PARAM_LIST: ApiParamOptions[] = []

export const <%= singular(uppercased(name)) %>_DOC_ADMIN_QUERY_LIST : ApiQueryOptions[] = []
export const <%= singular(uppercased(name)) %>_DOC_ADMIN_PARAM_DETAIL: ApiParamOptions[] = [
  {
    name: 'id',
    allowEmptyValue: false,
    required: true,
    type: 'number',
  },
]
