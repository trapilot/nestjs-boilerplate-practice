import { Country, District } from '@runtime/prisma-client'

export type TDistrict = District & {
  country?: Country
}
