import { PrismaClient } from '@prisma/client/extension'

export class PrismaReplicaManager {
  private cursor: number = 0
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
    const client = this.clients[this.cursor]
    this.cursor = (this.cursor + 1) % this.clients.length

    return client
  }
}
