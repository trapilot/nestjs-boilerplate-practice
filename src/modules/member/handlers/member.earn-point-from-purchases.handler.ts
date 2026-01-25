import { Injectable } from '@nestjs/common'
import { EnumScopeType, HelperService, IQueueHandler, LoggerService, OnScope } from 'lib/nest-core'
import { EnumMemberQueue } from '../enums'
import { MemberService } from '../services'

@Injectable()
export class MemberEarnPointFromPurchaseHandler implements IQueueHandler {
  topic: string = EnumMemberQueue.EARN_POINT_FROM_PURCHASE
  version: number = 1

  constructor(
    private readonly logger: LoggerService,
    private readonly helperService: HelperService,
    private readonly memberService: MemberService,
  ) {}

  @OnScope(EnumScopeType.QUEUE, {
    context: EnumMemberQueue.EARN_POINT_FROM_PURCHASE,
    async: true,
  })
  async handle(): Promise<void> {
    this.logger.log(`${this.topic}:v${this.version} is handling...`)

    const nowDate = this.helperService.dateNow()

    await this.memberService.earnPointFromInvoices(nowDate)
  }
}
