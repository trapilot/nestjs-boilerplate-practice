import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { MemberCreatedEvent } from '../events'
import { MemberService } from '../services'

@Injectable()
export class MemberListener {
  constructor(private readonly memberService: MemberService) {}

  @OnEvent(MemberCreatedEvent.eventPath, { async: true })
  async onCreated(event: MemberCreatedEvent) {
    await this.memberService.onCreated(event.member)
  }
}
