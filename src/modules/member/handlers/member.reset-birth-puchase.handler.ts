import { Injectable } from '@nestjs/common'
import { QueueCursor } from '@runtime/prisma-client'
import {
  EnumQueuePriority,
  EnumScopeType,
  HelperService,
  IQueueHandler,
  LoggerService,
  OnScope,
  QueueProducer,
  QueueScanner,
} from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { EnumMemberQueue } from '../enums/member.enum'
import { MemberService } from '../services/member.service'

@Injectable()
export class MemberResetBirthPurchaseHandler implements IQueueHandler {
  topic: string = EnumMemberQueue.RESET_BIRTH_PURCHASE
  version: number = 1

  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly scanner: QueueScanner,
    private readonly producer: QueueProducer,
    private readonly helperService: HelperService,
    private readonly memberService: MemberService,
  ) {}

  @OnScope(EnumScopeType.QUEUE, { context: EnumMemberQueue.RESET_BIRTH_PURCHASE, async: true })
  async handle(): Promise<void> {
    this.logger.log(`${this.topic}:v${this.version} is handling...`)

    const state = await this.scanner.scan<QueueCursor>(this.topic, this.version)
    const nowDate = this.helperService.dateNow()
    const rangeDate = this.helperService.dateRange(nowDate)

    const members = await this.prisma.member.findMany({
      where: {
        hasBirthPurchased: true,
        hasBirthPurchasedAt: { gte: rangeDate.startOfYear, not: null },
      },
      cursor: state.lastId ? { id: state.lastId } : undefined,
      select: { id: true },
      take: 500,
    })

    const memberIds = members.map(i => i.id)
    if (!memberIds.length) {
      // reset cursor to start over next time.
      this.logger.log(`${this.topic}:v${this.version} completed`)
      await this.scanner.reset(this.topic, this.version)
      return
    }

    // handle job
    await this.memberService.resetBirthPurchased(memberIds)

    // update cursor
    await this.scanner.commit(this.topic, {
      version: this.version,
      batchId: state.batchId + 1,
      lastId: memberIds[memberIds.length - 1],
    })

    // republish queue job
    this.logger.log(`${this.topic}:v${this.version}:${state.batchId} republish`)
    await this.producer.republish(this.topic, {
      version: this.version,
      priority: EnumQueuePriority.HIGH,
    })
  }
}
