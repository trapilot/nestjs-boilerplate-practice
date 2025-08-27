import { <%= singular(classify(name)) %> } from '@prisma/client'

export interface T<%= singular(classify(name)) %> extends <%= singular(classify(name)) %> {}
