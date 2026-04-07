import { Injectable } from '@nestjs/common'
import { EnumScopeType, IWorkerHandler, LoggerService, OnScope } from 'lib/nest-core'
import { EnumMemberQueue } from '../enums/member.enum'
import { IMemberGrantTierRewardPayload } from '../interfaces/member.interface'
import { MemberService } from '../services/member.service'

@Injectable()
export class MemberGrantTierRewardHandler implements IWorkerHandler {
  topic: string = EnumMemberQueue.PROC_GRANT_TIER_REWARD
  version: number = 1

  constructor(
    private readonly logger: LoggerService,
    private readonly memberService: MemberService,
  ) {}

  @OnScope(EnumScopeType.QUEUE, {
    context: EnumMemberQueue.PROC_GRANT_TIER_REWARD,
  })
  async handle(version: number, payload: IMemberGrantTierRewardPayload): Promise<void> {
    this.logger.log(`${this.topic}:v${version} is handling...`)

    // handle job
    await this.memberService.grantTierReward(payload.memberId, {
      tierId: payload.tierId,
      issuedAt: payload.issuedAt,
    })
  }
}
