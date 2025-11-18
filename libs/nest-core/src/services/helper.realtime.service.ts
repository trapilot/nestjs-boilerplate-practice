import { RedisClientType } from '@keyv/redis'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { REALTIME_PUB, REALTIME_STREAM, REALTIME_SUB } from '../constants'

@Injectable()
export class HelperRealtimeService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @Inject(REALTIME_PUB) private readonly pubClient: RedisClientType,
    @Inject(REALTIME_SUB) private readonly subClient: RedisClientType,
    @Inject(REALTIME_STREAM) private readonly streamClient: RedisClientType,
  ) {}

  async cacheSet(key: string, value: any, ttl = 60) {
    await this.cache.set(key, value, ttl * 1000)
  }

  async cacheGet<T = any>(key: string): Promise<T | null> {
    return this.cache.get<T>(key)
  }

  async cacheDel(key: string) {
    await this.cache.del(key)
  }

  async publish(channel: string, message: any) {
    const payload = typeof message === 'string' ? message : JSON.stringify(message)
    await this.pubClient.publish(channel, payload)
  }

  async subscribe(channel: string, handler: (message: any) => void) {
    await this.subClient.subscribe(channel, (message) => {
      try {
        handler(JSON.parse(message))
      } catch {
        handler(message)
      }
    })
  }

  async addStream(stream: string, data: Record<string, string>) {
    return this.streamClient.xAdd(stream, '*', data)
  }

  async createGroup(stream: string, group: string) {
    try {
      await this.streamClient.xGroupCreate(stream, group, '$', { MKSTREAM: true })
    } catch (err) {
      if (!String(err).includes('BUSYGROUP')) throw err
    }
  }

  async readGroup(group: string, consumer: string, streams: string[]) {
    return this.streamClient.xReadGroup(
      group,
      consumer,
      streams.map((s) => ({ key: s, id: '>' })),
      { COUNT: 10, BLOCK: 2000 },
    )
  }

  async ackStream(stream: string, group: string, id: string) {
    await this.streamClient.xAck(stream, group, id)
  }
}
