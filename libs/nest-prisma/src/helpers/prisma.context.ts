import { AsyncLocalStorage } from 'node:async_hooks'

export interface TenantStore {
  tenantId: string
}

export interface PrismaStore {
  tx?: any
  forcePrimary?: boolean
}

export const PrismaContext = new AsyncLocalStorage<PrismaStore>()
export const TenantContext = new AsyncLocalStorage<TenantStore>()
