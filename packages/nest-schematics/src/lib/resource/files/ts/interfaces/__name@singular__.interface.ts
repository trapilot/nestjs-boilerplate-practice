import { <%= singular(classify(name)) %> } from '@runtime/prisma-client'

export type T<%= singular(classify(name)) %> = <%= singular(classify(name)) %>
