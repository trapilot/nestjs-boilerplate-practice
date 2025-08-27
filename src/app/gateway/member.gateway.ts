import { Logger } from '@nestjs/common'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { ISocketBulkMessage, ISocketMessage, NEST_WSS } from 'lib/nest-core'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({ cors: { origin: '*' } })
export class MemberGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server

  private readonly logger = new Logger(NEST_WSS)
  private readonly enabled = process.env.WSS_ENABLE === 'true'
  private readonly clients = new Map<string, Socket>()

  handleConnection(client: Socket) {
    const identificationTimer = setTimeout(() => {
      if (!client.data.userId) {
        this.logger.log(`Closing socket due to timeout: ${client.id}`)
        client.disconnect()
      }
    }, 5_000)

    client.on('identify', (userToken: string, userId?: number) => {
      clearTimeout(identificationTimer)

      this.identify(client, userToken, userId)
    })

    client.data = {
      userId: undefined,
      verifyAt: undefined,
      verifyToken: undefined,
      joinAt: new Date().getTime(),
    }
    this.clients.set(client.id, client)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Disconnected: ${client.id} ${client.data.userId} ${client.data.verifyToken}`)
    this.clients.delete(client.id)
  }

  sendToClient(userId: number, message: ISocketMessage) {
    if (!this.enabled) return

    const { token, ...data } = message
    Array.from(this.clients.values())
      .filter((client: Socket) => client.data && client.data.userId == userId)
      .filter((client: Socket) => !token || client.data.verifyToken !== token)
      .forEach((client: Socket) => client.emit('message', data))
  }

  sendToAllClients(message: ISocketBulkMessage) {
    if (!this.enabled) return

    Array.from(this.clients.values()).forEach((client: Socket) => client.emit('message', message))
  }

  map(userToken: string, userId: number) {
    Array.from(this.clients.values())
      .filter(({ data }) => data.verifyToken === userToken)
      .forEach((client: Socket) => (client.data.userId = userId))
  }

  private identify(client: Socket, userToken: string, userId?: number) {
    client.data = {
      userId,
      verifyAt: new Date().getTime(),
      verifyToken: userToken,
    }
  }

  private random(options: { length: number }): string {
    const digits = '0123456789'
    const shuffledDigits = digits
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('')

    const code = shuffledDigits.substring(0, options.length)
    const client = Array.from(this.clients.values()).find(
      (client: Socket) => code === client.data.code,
    )

    return client ? this.random(options) : code
  }

  // cspell:disable
  private createId(): string {
    let d = new Date().getTime()
    let d2 =
      (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = Math.random() * 16
      if (d > 0) {
        r = (d + r) % 16 | 0
        d = Math.floor(d / 16)
      } else {
        r = (d2 + r) % 16 | 0
        d2 = Math.floor(d2 / 16)
      }
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
  }
  // cspell:enable
}
