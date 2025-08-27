<% if (auth) { %>export const <%= singular(uppercased(name)) %>_DOC_OPERATION = '<%= named(name) %>'
export const <%= singular(uppercased(name)) %>_DOC_AUTH_OPERATION = 'Authentication'<% } else { %>export const <%= singular(uppercased(name)) %>_DOC_OPERATION = '<%= named(name) %>'<% } %>

export const <%= singular(uppercased(name)) %>_DOC_APP_QUERY_LIST = []
export const <%= singular(uppercased(name)) %>_DOC_APP_PARAM_LIST = []

export const <%= singular(uppercased(name)) %>_DOC_ADMIN_QUERY_LIST = []
export const <%= singular(uppercased(name)) %>_DOC_ADMIN_PARAM_DETAIL = [
  {
    name: 'id',
    allowEmptyValue: false,
    required: true,
    type: () => Number,
  },
]
