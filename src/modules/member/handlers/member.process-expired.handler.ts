import { Injectable } from '@nestjs/common'
import { EnumScopeType, IWorkerHandler, LoggerService, OnScope } from 'lib/nest-core'
import { MEMBER_QUEUE_SCAN_VERSION } from '../constants/member.constant'
import { EnumMemberQueue } from '../enums/member.enum'
import { MemberService } from '../services/member.service'

@Injectable()
export class MemberProcessExpiredHandler implements IWorkerHandler {
  topic: string = EnumMemberQueue.PROC_EXPIRED
  version: number = MEMBER_QUEUE_SCAN_VERSION[EnumMemberQueue.SCAN_EXPIRED]

  constructor(
    private readonly logger: LoggerService,
    private readonly memberService: MemberService,
  ) {}

  @OnScope(EnumScopeType.QUEUE, {
    context: EnumMemberQueue.PROC_EXPIRED,
  })
  async handle(version: number, message: { memberIds: number[] }): Promise<void> {
    this.logger.log(`${this.topic}:v${version} is handling`)

    for (const memberId of message.memberIds) {
      try {
        await this.memberService.processExpiredMember(Number(memberId))
      } catch {}
    }
  }
}
