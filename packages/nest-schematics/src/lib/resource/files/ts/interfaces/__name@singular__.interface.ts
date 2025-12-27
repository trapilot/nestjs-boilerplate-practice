import { <%= singular(classify(name)) %> } from '@runtime/prisma-client'

export interface T<%= singular(classify(name)) %> extends <%= singular(classify(name)) %> {}
