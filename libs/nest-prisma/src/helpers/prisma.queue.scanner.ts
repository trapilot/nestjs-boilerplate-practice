import { Injectable } from '@nestjs/common'
import { QueueCursor } from '@runtime/prisma-client'
import { EnumQueuePriority, IWorkerCursor, WorkerProducer, WorkerScanner } from 'lib/nest-core'
import { PrismaService } from '../services'

@Injectable()
export class PrismaWorkerScanner extends WorkerScanner {
  constructor(
    private readonly prisma: PrismaService,
    private readonly producer: WorkerProducer,
  ) {
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

  async runWithCursor<T>({
    topic,
    version,
    chunking,
    context,
    retrieve,
    process,
    beforeReset,
    shouldRepublish,
  }: {
    topic: string
    version: number
    chunking?: number
    context?: { message: object; childKey: string | number }
    retrieve: (state: IWorkerCursor) => Promise<T[]>
    process: (items: T[]) => Promise<number | null>
    beforeReset?: (state: IWorkerCursor) => Promise<void>
    shouldRepublish?: (items: T[], state: QueueCursor) => Promise<boolean>
  }): Promise<void> {
    const childTopic = context?.childKey ? `${topic}:child:${context?.childKey}` : topic
    const state = await this.scan<QueueCursor>(childTopic, version)

    const items = await retrieve(state)

    if (!items.length) {
      if (beforeReset) {
        await beforeReset(state)
      }

      await this.reset(childTopic, version)
      return
    }

    let lastId = null
    if (chunking && chunking > 0) {
      let _items = []
      for (const item of items) {
        _items.push(item)

        if (_items.length === chunking) {
          lastId = await process(_items)
          _items = []
        }
      }

      if (_items.length) {
        lastId = await process(_items)
        _items = []
      }
    } else {
      lastId = await process(items)
    }

    await this.commit(childTopic, {
      version,
      lastId,
      batchId: (state.batchId || 0) + 1,
    })

    if ((await shouldRepublish?.(items, state)) ?? true) {
      await this.producer.republish(topic, {
        version,
        message: context?.message,
        priority: EnumQueuePriority.HIGH,
      })
    }
  }
}
