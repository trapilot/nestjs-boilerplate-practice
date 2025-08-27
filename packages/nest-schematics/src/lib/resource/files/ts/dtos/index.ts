<% if (auth) { %>export * from './<%= singular(name) %>.request.change-password.dto'
export * from './<%= singular(name) %>.request.create.dto'
export * from './<%= singular(name) %>.request.sign-in.dto'
export * from './<%= singular(name) %>.request.sign-up.dto'
export * from './<%= singular(name) %>.request.update.dto'<% } else { %>export * from './<%= singular(name) %>.request.create.dto'
export * from './<%= singular(name) %>.request.update.dto'<% } %>
export * from './<%= singular(name) %>.response.detail.dto'
<% if (auth) { %>export * from './<%= singular(name) %>.response.payload.dto'
export * from './<%= singular(name) %>.response.profile.dto'<% } %>
