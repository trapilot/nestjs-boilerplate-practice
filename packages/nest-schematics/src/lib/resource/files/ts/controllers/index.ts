export * from './<%= singular(name) %>.admin.controller'
<% if (auth) { %>export * from './<%= singular(name) %>.app.controller'
export * from './<%= singular(name) %>.auth.controller'<% } else { %>export * from './<%= singular(name) %>.app.controller'<% } %>
