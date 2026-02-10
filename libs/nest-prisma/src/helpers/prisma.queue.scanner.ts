import { Injectable } from '@nestjs/common'
import { QueueScanner } from 'lib/nest-core'
import { PrismaService } from '../services'

@Injectable()
export class PrismaQueueScanner extends QueueScanner {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async scan<T>(name: string, version: number): Promise<T> {
    return this.prisma.queueCursor.upsert({
      where: { name_version: { name, version } },
      update: {},
      create: { name, version },
    }) as T
  }

  async scans<T>(name: string): Promise<T[]> {
    const exists = await this.prisma.queueCursor.exists({ where: { name } })
    if (exists) {
      const items = this.prisma.queueCursor.findMany({
        where: { name },
      })
      return items as unknown as T[]
    }
    return []
  }

  async reset(name: string, version: number): Promise<void> {
    await this.prisma.queueCursor.update({
      where: { name_version: { name, version } },
      data: { lastId: null, batchId: null },
    })
  }

  async commit(
    name: string,
    options: { version: number; batchId: number | null; lastId: number | null },
  ): Promise<number | null> {
    const updated = await this.prisma.queueCursor.update({
      where: { name_version: { name, version: options.version } },
      data: { lastId: options.lastId, batchId: options.batchId },
      select: { lastId: true, batchId: true },
    })
    return updated?.lastId
  }
}
