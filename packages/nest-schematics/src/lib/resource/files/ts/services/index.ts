<% if (auth) { %>export * from './<%= singular(name) %>.auth.service'
export * from './<%= singular(name) %>.service'<% } else { %>export * from './<%= singular(name) %>.service'<% } %>
