import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaManager implements OnModuleDestroy {
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

  async onModuleDestroy() {
    await Promise.all(Object.values(this.clients).map((client) => client.$disconnect()))
  }
}
