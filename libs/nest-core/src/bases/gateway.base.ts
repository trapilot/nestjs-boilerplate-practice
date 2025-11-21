import { Logger } from '@nestjs/common'
import { WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { NEST_WSS } from '../constants'
import { IClientData, IClientIdentify, IClientMessage, IClientQuery } from '../interfaces'

export abstract class GateWayBase {
  @WebSocketServer() server: Server

  private pendingTokens = new Map<string, string>()
  protected connTimeout = 5_000
  protected readonly logger = new Logger(NEST_WSS)
  protected readonly enabled = process.env.WSS_ENABLE === 'true'

  handleConnection(client: Socket) {
    if (!this.enabled) return

    const connTimer = setTimeout(() => {
      if (!client?.data?.verifyAt) {
        this.logger.log(`Closing socket due to timeout: ${client.id}`)
        client.disconnect()
      }
    }, this.connTimeout)

    client.on('identify', (userData: IClientIdentify) => {
      clearTimeout(connTimer)

      const verifyAt = new Date().getTime()
      const validToken = this.pendingTokens.get(client.id)
      if (userData?.userToken == validToken) {
        client.data.verifyAt = verifyAt

        this.revokeToken(client)
        this.setOnline(client)
      }
    })

    const query: IClientQuery = client.handshake.query as unknown as IClientQuery
    const join: Omit<IClientData, 'verifyAt'> = {
      userId: `${query.userId}`,
      userDevice: `${query.userDevice}`,
      userToken: this.randomToken(client.id),
      joinAt: new Date().getTime(),
    }

    this.pendingTokens.set(client.id, join.userToken)
    client.data = join
  }

  handleDisconnect(client: Socket) {
    this.revokeToken(client)
    this.setOffline(client)
  }

  setOnline(_: Socket) {}
  setOffline(_: Socket) {}

  private revokeToken(client: Socket) {
    this.pendingTokens.delete(client.id)
  }

  private randomToken(clientId: string): string {
    let d = new Date().getTime()
    let d2 =
      (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = Math.random() * 16
      let h = 0
      for (let i = 0; i < clientId.length; i++) {
        h = (h << 5) - h + clientId.charCodeAt(i)
        h |= 0
      }
      h = Math.abs(h)

      if (d > 0) {
        r = (d + r + h) % 16 | 0
        d = Math.floor(d / 16)
      } else {
        r = (d2 + r + h) % 16 | 0
        d2 = Math.floor(d2 / 16)
      }
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
  }

  sendToClient(userId: string, userToken: string, message: IClientMessage) {
    Array.from(this.server.sockets.sockets.values())
      .filter(({ data }) => data?.userId === userId && data?.userToken === userToken)
      .forEach((client: Socket) => client.emit('message', message))
  }

  sendToClients(userId: string, message: IClientMessage) {
    Array.from(this.server.sockets.sockets.values())
      .filter(({ data }) => data?.userId === userId)
      .forEach((client: Socket) => client.emit('message', message))
  }

  sendToAllClients(message: IClientMessage) {
    Array.from(this.server.sockets.sockets.values())
      .filter(({ data }) => data?.userId)
      .forEach((client: Socket) => client.emit('message', message))
  }
}
