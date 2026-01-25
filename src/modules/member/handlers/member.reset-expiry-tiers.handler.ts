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
import { EnumMemberQueue } from '../enums'
import { MemberService } from '../services'

@Injectable()
export class MemberResetExpiryTierHandler implements IQueueHandler {
  topic: string = EnumMemberQueue.RESET_EXPIRY_TIERS
  version: number = 1

  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly scanner: QueueScanner,
    private readonly producer: QueueProducer,
    private readonly helperService: HelperService,
    private readonly memberService: MemberService,
  ) {}

  @OnScope(EnumScopeType.QUEUE, { context: EnumMemberQueue.RESET_EXPIRY_TIERS, async: true })
  async handle(): Promise<void> {
    this.logger.log(`${this.topic}:v${this.version} is handling...`)

    const state = await this.scanner.scan<QueueCursor>(this.topic, this.version)
    const nowDate = this.helperService.dateNow()

    const memberTiers = await this.prisma.memberTierHistory.findMany({
      where: {
        isActive: true,
        expiryDate: { lte: nowDate },
      },
      cursor: state.lastId ? { id: state.lastId } : undefined,
      select: { id: true },
      take: 500,
    })

    const mtIds = memberTiers.map(i => i.id)
    if (!mtIds.length) {
      // reset cursor to start over next time.
      this.logger.log(`${this.topic}:v${this.version} completed`)
      await this.scanner.reset(this.topic, this.version)
      return
    }

    // handle job
    await this.memberService.resetMemberTiers(mtIds)

    // update cursor
    await this.scanner.commit(this.topic, {
      version: this.version,
      batchId: state.batchId + 1,
      lastId: mtIds[mtIds.length - 1],
    })

    // republish queue job
    this.logger.log(`${this.topic}:v${this.version}:${state.batchId} republish`)
    await this.producer.republish(this.topic, {
      version: this.version,
      priority: EnumQueuePriority.HIGH,
    })
  }
}
