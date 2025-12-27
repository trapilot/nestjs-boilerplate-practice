import { Product, ProductLanguage } from '@runtime/prisma-client'

export type TProduct = Product & {
  languages?: ProductLanguage[]
}
