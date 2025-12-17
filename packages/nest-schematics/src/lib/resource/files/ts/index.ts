<% if (auth) { %>export * from './<%= singular(name) %>.auth.module'
export * from './<%= singular(name) %>.module'<% } else { %>export * from './<%= singular(name) %>.module'<% } %>
