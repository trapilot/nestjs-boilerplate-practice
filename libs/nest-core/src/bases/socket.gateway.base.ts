import { WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { StrUtil } from '../utils'

interface IClientData {
  userId: string
  userToken: string
  userDevice: string
  joinAt: number
  verifyAt: number
}

interface IClientMessage {
  data: IClientData
  version?: string
}

interface IClientIdentify {
  userId: string
  userToken: string
}

interface IClientQuery {
  userId: string
  userDevice: string
  [key: string]: string | number | string[]
}

export abstract class SocketGateWayBase {
  @WebSocketServer() server: Server
  protected readonly enabled = StrUtil.isTrue(process.env.APP_WEBSOCKET)

  abstract setOnline(_client: Socket): Promise<boolean>
  abstract setOffline(_client: Socket): Promise<boolean>

  private pendingTokens = new Map<string, string>()
  private connTimeout = 5_000

  handleConnection(client: Socket): boolean {
    if (!this.enabled) {
      return
    }

    setTimeout(() => {
      if (!client?.data?.verifyAt) {
        client.disconnect()
      }
    }, this.connTimeout)

    client.on('identify', (userData: IClientIdentify) => {
      const verifyAt = new Date().getTime()
      const validToken = this.pendingTokens.get(client.id)
      if (userData?.userToken === validToken) {
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

    client.data = join

    this.pendingTokens.set(client.id, join.userToken)
    client.emit('token', { token: join.userToken })
    return true
  }

  async handleDisconnect(client: Socket): Promise<boolean> {
    await this.revokeToken(client)
    await this.setOffline(client)
    return true
  }

  async revokeToken(client: Socket): Promise<boolean> {
    this.pendingTokens.delete(client.id)
    return true
  }

  private randomToken(clientId: string): string {
    let d = new Date().getTime()
    let d2 =
      (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      let r = Math.random() * 16
      let h = 0
      for (let i = 0; i < clientId.length; i++) {
        h = (h << 5) - h + clientId.charCodeAt(i)
        h |= 0
      }
      h = Math.abs(h)

      if (d > 0) {
        r = ((d + r + h) % 16) | 0
        d = Math.floor(d / 16)
      } else {
        r = ((d2 + r + h) % 16) | 0
        d2 = Math.floor(d2 / 16)
      }
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
  }

  sendToClient(userId: string, userToken: string, message: IClientMessage): boolean {
    Array.from(this.server.sockets.sockets.values())
      .filter(({ data }) => data?.userId === userId && data?.userToken === userToken)
      .forEach((client: Socket) => client.emit('message', message))
    return true
  }

  sendToClients(userId: string, message: IClientMessage): boolean {
    Array.from(this.server.sockets.sockets.values())
      .filter(({ data }) => data?.userId === userId)
      .forEach((client: Socket) => client.emit('message', message))
    return true
  }

  sendToAllClients(message: IClientMessage): boolean {
    Array.from(this.server.sockets.sockets.values())
      .filter(({ data }) => data?.userId)
      .forEach((client: Socket) => client.emit('message', message))
    return true
  }
}
