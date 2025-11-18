import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { HelperMessageService } from 'lib/nest-core'
import { MemberGateway } from 'src/app/gateway'
import { MemberSignInEvent } from '../events'

@Injectable()
export class MemberAuthListener {
  constructor(
    private readonly memberGateway: MemberGateway,
    private readonly helperMessageService: HelperMessageService,
  ) {}

  @OnEvent(MemberSignInEvent.eventPath, { async: true })
  async onMemberSignIn(event: MemberSignInEvent) {
    // map member id if socket have not identified yet
    this.memberGateway.map(event.memberToken, event.memberId)

    this.memberGateway.sendToClient(event.memberId, {
      token: event.memberToken,
      data: {
        message: this.helperMessageService.setMessage('auth.error.uniqueLoggedIn'),
      },
    })
  }
}
