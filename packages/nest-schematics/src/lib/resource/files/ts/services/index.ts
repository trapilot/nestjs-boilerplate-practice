<% if (auth) { %>export * from './auth.service'
export * from './<%= singular(name) %>.service'<% } else { %>export * from './<%= singular(name) %>.service'<% } %>
