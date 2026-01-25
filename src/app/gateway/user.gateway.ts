import { WebSocketGateway } from '@nestjs/websockets'
import { SocketGateWayBase } from 'lib/nest-core'
import { Socket } from 'socket.io'

@WebSocketGateway({ cors: { origin: '*' } })
export class UserGateway extends SocketGateWayBase {
  async setOnline(_client: Socket): Promise<boolean> {
    return false
  }

  async setOffline(_client: Socket): Promise<boolean> {
    return false
  }
}
