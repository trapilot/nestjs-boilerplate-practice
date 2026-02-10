import { Tier, TierLanguage, TierRate, TierTransition } from '@runtime/prisma-client'

export type TTierTransition = TierTransition

export type TTier = Tier & {
  languages?: TierLanguage[]
  transitions?: TierTransition[]
  rates?: TierRate[]
}
