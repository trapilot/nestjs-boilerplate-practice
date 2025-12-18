import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { GateWayBase, RealtimeService } from 'lib/nest-core'
import { Socket } from 'socket.io'

@WebSocketGateway({ cors: { origin: '*' } })
export class MemberGateway extends GateWayBase {
  constructor(protected readonly realtimeService: RealtimeService) {
    super()
  }

  @SubscribeMessage('heartbeat')
  async onHeartbeat(client: Socket) {
    const { userId, userDevice } = client.data

    await this.realtimeService.cacheSet(`member:${userId}:device:${userDevice}`, 1, 60)
    await this.realtimeService.cacheSet(`member:${userId}:online`, 1, 60)
  }

  async setOnline(client: Socket) {
    const { userId, userDevice } = client.data

    await this.realtimeService.cacheSet(`member:${userId}:device:${userDevice}`, 1, 60)
    await this.realtimeService.cacheSadd(`member:${userId}:devices`, userDevice)
  }

  async setOffline(client: Socket) {
    const { userId, userDevice } = client.data

    await this.realtimeService.cacheDel(`member:${userId}:device:${userDevice}`)
    await this.realtimeService.cacheSrem(`member:${userId}:devices`, userDevice)
  }

  async getUserDevices(userId: string) {
    return this.realtimeService.cacheSMembers(`member:${userId}:devices`)
  }

  async isUserOnline(userId: string) {
    const counter = await this.realtimeService.cacheScard(`member:${userId}:devices`)
    return counter > 0
  }
}
