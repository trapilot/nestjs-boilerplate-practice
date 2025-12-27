import { PrismaClient } from '@prisma/client/extension'
import { TenantContext } from '../helpers'

export class PrismaTenantManager {
  private clients: { [key: string]: PrismaClient }

  constructor(clients: { [key: string]: PrismaClient }) {
    this.clients = clients
  }

  async connect() {
    await Promise.all(Object.values(this.clients).map((client) => client.$connect()))
  }

  async disconnect() {
    await Promise.all(Object.values(this.clients).map((client) => client.$disconnect()))
  }

  pick(): PrismaClient {
    const tenantId = TenantContext.getStore()?.tenantId
    return this.clients[tenantId]
  }
}
