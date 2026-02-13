import { Injectable } from '@nestjs/common'
import { EnumScopeType, IQueueHandler, LoggerService, OnScope } from 'lib/nest-core'
import { EnumMemberQueue } from '../enums/member.enum'
import { IMemberEarnPurchasePayload } from '../interfaces/member.interface'

@Injectable()
export class MemberEarnPointFromPurchaseHandler implements IQueueHandler {
  topic: string = EnumMemberQueue.EARN_POINT_FROM_PURCHASE
  version: number = 1

  constructor(private readonly logger: LoggerService) {}

  @OnScope(EnumScopeType.QUEUE, {
    context: EnumMemberQueue.EARN_POINT_FROM_PURCHASE,
    async: true,
  })
  async handle(payload: IMemberEarnPurchasePayload): Promise<void> {
    this.logger.log(`${this.topic}:v${this.version} is handling...`)

    console.log({ payload })
    // TODO
    // await this.memberService.earnPointFromInvoices(nowDate)
  }
}
