<% if (auth) { %>
import { EnumAuthScopeType } from 'lib/nest-auth'
<% } %>

export const <%= singular(uppercased(name)) %>_UPLOAD_IMAGE_PATH = 'public/uploads/images/<%= plural(name) %>'

<% if (auth) { %>
export const <%= singular(uppercased(name)) %>_AUTH_TOKEN = EnumAuthScopeType.<%= singular(uppercased(name)) %>
<% } %>
