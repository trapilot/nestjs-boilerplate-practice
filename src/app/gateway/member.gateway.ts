import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { CacheService } from 'lib/nest-core'
import { GateWayBase } from 'shared/bases'
import { Socket } from 'socket.io'

@WebSocketGateway({ cors: { origin: '*' } })
export class MemberGateway extends GateWayBase {
  constructor(private readonly cache: CacheService) {
    super()
  }

  @SubscribeMessage('heartbeat')
  async onHeartbeat(client: Socket) {
    const { userId, userDevice } = client.data

    await this.cache.set(`member:${userId}:device:${userDevice}`, 1, 60)
    await this.cache.set(`member:${userId}:online`, 1, 60)
  }

  async setOnline(client: Socket) {
    const { userId, userDevice } = client.data

    await this.cache.set(`member:${userId}:device:${userDevice}`, 1, 60)
    // await this.cache.sadd(`member:${userId}:devices`, userDevice)
  }

  async setOffline(client: Socket) {
    const { userId, userDevice } = client.data

    await this.cache.del(`member:${userId}:device:${userDevice}`)
    // await this.cache.srem(`member:${userId}:devices`, userDevice)
  }

  async getUserDevices(_userId: string) {
    // return this.cache.sMembers(`member:${userId}:devices`)
  }

  async isUserOnline(_userId: string) {
    // const counter = await this.cache.scard(`member:${userId}:devices`)
    // return counter > 0
    return false
  }
}
