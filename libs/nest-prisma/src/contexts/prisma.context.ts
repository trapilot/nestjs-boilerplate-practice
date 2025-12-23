// tenant-context.ts
import { AsyncLocalStorage } from 'node:async_hooks'

export interface TenantStore {
  tenantId: string
}

export interface PrismaStore {
  tx?: any
}

export const PrismaContext = new AsyncLocalStorage<PrismaStore>()
export const TenantContext = new AsyncLocalStorage<TenantStore>()
