import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { GateWayBase, HelperRealtimeService } from 'lib/nest-core'
import { Socket } from 'socket.io'

@WebSocketGateway({ cors: { origin: '*' } })
export class MemberGateway extends GateWayBase {
  constructor(protected readonly helperRealtimeService: HelperRealtimeService) {
    super()
  }

  @SubscribeMessage('heartbeat')
  async onHeartbeat(client: Socket) {
    const { userId, userDevice } = client.data

    await this.helperRealtimeService.cacheSet(`member:${userId}:device:${userDevice}`, 1, 60)
    await this.helperRealtimeService.cacheSet(`member:${userId}:online`, 1, 60)
  }

  async setOnline(client: Socket) {
    const { userId, userDevice } = client.data

    await this.helperRealtimeService.cacheSet(`member:${userId}:device:${userDevice}`, 1, 60)
    await this.helperRealtimeService.cacheSadd(`member:${userId}:devices`, userDevice)
  }

  async setOffline(client: Socket) {
    const { userId, userDevice } = client.data

    await this.helperRealtimeService.cacheDel(`member:${userId}:device:${userDevice}`)
    await this.helperRealtimeService.cacheSrem(`member:${userId}:devices`, userDevice)
  }

  async getUserDevices(userId: string) {
    return this.helperRealtimeService.cacheSMembers(`member:${userId}:devices`)
  }

  async isUserOnline(userId: string) {
    const counter = await this.helperRealtimeService.cacheScard(`member:${userId}:devices`)
    return counter > 0
  }
}
