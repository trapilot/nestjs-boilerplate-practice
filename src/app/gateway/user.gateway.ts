import { WebSocketGateway } from '@nestjs/websockets'
import { GateWayBase } from 'lib/nest-core'

@WebSocketGateway({ cors: { origin: '*' } })
export class UserGateway extends GateWayBase {}
