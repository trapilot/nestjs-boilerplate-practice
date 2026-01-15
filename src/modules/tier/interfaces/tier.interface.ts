import { Tier, TierChart, TierLanguage } from '@runtime/prisma-client'

export type TTierChart = TierChart

export type TTier = Tier & {
  charts?: TTierChart[]
  languages?: TierLanguage[]
}
