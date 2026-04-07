import { Injectable } from '@nestjs/common'
import { EnumScopeType, IWorkerHandler, LoggerService, OnScope } from 'lib/nest-core'
import { EnumMemberQueue } from '../enums/member.enum'
import { IMemberEarnPurchasePayload } from '../interfaces/member.interface'

@Injectable()
export class MemberEarnPointFromPurchaseHandler implements IWorkerHandler {
  topic: string = EnumMemberQueue.PROC_EARN_POINTS
  version: number = 1

  constructor(private readonly logger: LoggerService) {}

  @OnScope(EnumScopeType.QUEUE, {
    context: EnumMemberQueue.PROC_EARN_POINTS,
  })
  async handle(version: number, payload: IMemberEarnPurchasePayload): Promise<void> {
    this.logger.log(`${this.topic}:v${version} is handling...`)

    console.log({ payload })
    // TODO
    // await this.memberService.earnPointFromInvoices(nowDate)
  }
}
