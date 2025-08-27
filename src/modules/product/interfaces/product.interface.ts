import { Product, ProductLanguage } from '@prisma/client'

export type TProduct = Product & {
  languages?: ProductLanguage[]
}
