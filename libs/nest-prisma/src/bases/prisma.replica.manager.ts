import { PrismaClient } from '@prisma/client/extension'

export class PrismaReplicaManager {
  private rrIndex: number = 0
  private clients: PrismaClient[]

  constructor(clients: PrismaClient[]) {
    this.clients = clients
  }

  async connect() {
    await Promise.all(this.clients.map((client) => client.$connect()))
  }

  async disconnect() {
    await Promise.all(this.clients.map((client) => client.$disconnect()))
  }

  pick(): PrismaClient {
    const client = this.clients[this.rrIndex]
    this.rrIndex = (this.rrIndex + 1) % this.clients.length

    return client
  }
}
