import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { MessageService } from 'lib/nest-message'
import { MemberGateway } from 'src/app/gateway'
import { MemberSignInEvent } from '../events'

@Injectable()
export class MemberAuthListener {
  constructor(
    private readonly memberGateway: MemberGateway,
    private readonly messageService: MessageService,
  ) {}

  @OnEvent(MemberSignInEvent.eventPath, { async: true })
  async onMemberSignIn(event: MemberSignInEvent) {
    // map member id if socket have not identified yet
    this.memberGateway.map(event.memberToken, event.memberId)

    this.memberGateway.sendToClient(event.memberId, {
      token: event.memberToken,
      data: {
        message: this.messageService.setMessage('auth.error.uniqueLoggedIn'),
      },
    })
  }
}
