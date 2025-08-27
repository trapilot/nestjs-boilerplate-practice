import { Country, District } from '@prisma/client'

export interface TDistrict extends District {
  country?: Country
}
