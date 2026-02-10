import { Injectable } from '@nestjs/common'
import { EnumScopeType, IQueueHandler, LoggerService, OnScope } from 'lib/nest-core'
import { EnumMemberQueue } from '../enums/member.enum'
import { TMember } from '../interfaces/member.interface'
import { MemberService } from '../services/member.service'

@Injectable()
export class MemberGrantWelcomeRewardHandler implements IQueueHandler {
  topic: string = EnumMemberQueue.GRANT_WELCOME_REWARD
  version: number = 1

  constructor(
    private readonly logger: LoggerService,
    private readonly memberService: MemberService,
  ) {}

  @OnScope(EnumScopeType.QUEUE, {
    context: EnumMemberQueue.GRANT_WELCOME_REWARD,
    async: true,
  })
  async handle(member: TMember): Promise<void> {
    this.logger.log(`${this.topic}:v${this.version} is handling...`)

    // handle job
    await this.memberService.grantWelcomeReward(member)
  }
}
