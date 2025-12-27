import { Country, District } from '@runtime/prisma-client'

export interface TDistrict extends District {
  country?: Country
}
