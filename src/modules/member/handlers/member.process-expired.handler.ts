import { Injectable } from '@nestjs/common'
import { EnumScopeType, IQueueHandler, LoggerService, OnScope } from 'lib/nest-core'
import { EnumMemberQueue } from '../enums/member.enum'
import { MemberService } from '../services/member.service'

@Injectable()
export class MemberProcessExpiredHandler implements IQueueHandler {
  topic: string = EnumMemberQueue.PROCESS_EXPIRED
  version: number = 1

  constructor(
    private readonly logger: LoggerService,
    private readonly memberService: MemberService,
  ) {}

  @OnScope(EnumScopeType.QUEUE, { context: EnumMemberQueue.PROCESS_EXPIRED, async: true })
  async handle(message: { memberId: number }): Promise<void> {
    this.logger.log(`${this.topic}:v${this.version} is handling member ${message.memberId}`)

    // handle job
    await this.memberService.processExpiredMember(message.memberId)
  }
}
