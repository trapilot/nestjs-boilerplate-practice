import { Injectable } from '@nestjs/common'
import { EnumScopeType, IQueueHandler, LoggerService, OnScope } from 'lib/nest-core'
import { EnumMemberQueue } from '../enums/member.enum'
import { IMemberGrantTierRewardPayload } from '../interfaces/member.interface'
import { MemberService } from '../services/member.service'

@Injectable()
export class MemberGrantTierRewardHandler implements IQueueHandler {
  topic: string = EnumMemberQueue.GRANT_TIER_REWARD
  version: number = 1

  constructor(
    private readonly logger: LoggerService,
    private readonly memberService: MemberService,
  ) {}

  @OnScope(EnumScopeType.QUEUE, {
    context: EnumMemberQueue.GRANT_TIER_REWARD,
    async: true,
  })
  async handle(payload: IMemberGrantTierRewardPayload): Promise<void> {
    this.logger.log(`${this.topic}:v${this.version} is handling...`)

    // handle job
    await this.memberService.grantTierReward(payload.memberId, {
      tierId: payload.tierId,
      issuedAt: payload.issuedAt,
    })
  }
}
