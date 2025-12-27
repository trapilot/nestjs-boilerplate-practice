import { Tier, TierChart, TierLanguage } from '@runtime/prisma-client'

export interface TTierChart extends Omit<TierChart, 'id'> {}

export interface TTier extends Tier {
  charts?: TTierChart[]
  languages?: TierLanguage[]
}
