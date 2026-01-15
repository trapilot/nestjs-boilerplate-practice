import { WebSocketGateway } from '@nestjs/websockets'
import { GateWayBase } from 'shared/bases'

@WebSocketGateway({ cors: { origin: '*' } })
export class UserGateway extends GateWayBase {}
