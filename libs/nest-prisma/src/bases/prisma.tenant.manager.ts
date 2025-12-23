import { PrismaClient } from '@prisma/client/extension'

export class PrismaTenantManager {
  private clients: { [key: string]: PrismaClient } = {}

  async getClient(tenantId: string): Promise<PrismaClient> {
    let client = this.clients[tenantId]
    if (!client) {
      const databaseUrl = process.env.DATABASE_URL.replace('tenantId', tenantId.toLowerCase())

      client = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      })

      this.clients[tenantId] = client
    }

    return client
  }
}
