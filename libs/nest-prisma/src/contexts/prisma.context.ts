import { PrismaClient } from '@runtime/prisma-client'
import { AsyncLocalStorage } from 'node:async_hooks'

export interface IDbContextData {
  client?: PrismaClient
}

export class PrismaContext {
  private static readonly storage = new AsyncLocalStorage<IDbContextData>()

  static run<T>(data: IDbContextData, next: () => T): T {
    return this.storage.run(data, next)
  }

  static hasClient(): boolean {
    return !!this.storage.getStore()?.client
  }

  static getClient(): PrismaClient | undefined {
    return this.storage.getStore()?.client
  }

  static getClientOrThrow(): PrismaClient {
    const client = this.getClient()
    if (!client) {
      throw new Error('DbContext: no PrismaClient bound to current async context')
    }
    return client
  }
}
