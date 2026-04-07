import { Injectable } from '@nestjs/common'
import { EnumScopeType, IWorkerHandler, LoggerService, OnScope } from 'lib/nest-core'
import { MEMBER_QUEUE_PROC_VERSION } from '../constants/member.constant'
import { EnumMemberQueue } from '../enums/member.enum'
import { MemberService } from '../services/member.service'

@Injectable()
export class MemberProcessReleasePointsHandler implements IWorkerHandler {
  topic: string = EnumMemberQueue.PROC_PENDING_POINTS
  version: number = MEMBER_QUEUE_PROC_VERSION[EnumMemberQueue.PROC_PENDING_POINTS]

  constructor(
    private readonly logger: LoggerService,
    private readonly memberService: MemberService,
  ) {}

  @OnScope(EnumScopeType.QUEUE, {
    context: EnumMemberQueue.PROC_PENDING_POINTS,
  })
  async handle(version: number, message: { ids: number[] }): Promise<void> {
    this.logger.log(`${this.topic}:v${version} is handling`)

    await this.memberService.releasePendingPoints(message.ids)
  }
}
