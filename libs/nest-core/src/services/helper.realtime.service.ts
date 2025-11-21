import { RedisClientType } from '@keyv/redis'
import { Inject, Injectable } from '@nestjs/common'
import { REALTIME_CACHE, REALTIME_PUB, REALTIME_STREAM, REALTIME_SUB } from '../constants'

@Injectable()
export class HelperRealtimeService {
  constructor(
    @Inject(REALTIME_PUB) private readonly pubClient: RedisClientType,
    @Inject(REALTIME_SUB) private readonly subClient: RedisClientType,
    @Inject(REALTIME_CACHE) private readonly cacheClient: RedisClientType,
    @Inject(REALTIME_STREAM) private readonly streamClient: RedisClientType,
  ) {}

  async cacheGet<T = any>(key: string): Promise<T | null> {
    const raw = await this.cacheClient.get(key)
    if (!raw) return null

    try {
      return JSON.parse(raw as string)
    } catch {
      return raw as T
    }
  }

  async cacheSet(key: string, value: any, ttl = 60) {
    const payload = typeof value === 'string' ? value : JSON.stringify(value)
    return this.cacheClient.set(key, payload, { EX: ttl })
  }

  async cacheDel(key: string) {
    return this.cacheClient.del(key)
  }

  async cacheSadd(key: string, value: any) {
    return this.cacheClient.sAdd(key, value)
  }

  async cacheSrem(key: string, value: any) {
    return this.cacheClient.sRem(key, value)
  }

  async cacheScard(key: string) {
    return this.cacheClient.sCard(key)
  }

  async cacheSMembers(key: string) {
    return this.cacheClient.sMembers(key)
  }

  async cacheSisMember(key: string, member: any) {
    return this.cacheClient.sIsMember(key, member)
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
