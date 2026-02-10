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

@Injectable()
export class MemberScanExpiredHandler implements IQueueHandler {
  topic: string = EnumMemberQueue.SCAN_EXPIRED
  version: number = 1

  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly scanner: QueueScanner,
    private readonly producer: QueueProducer,
    private readonly helperService: HelperService,
  ) {}

  @OnScope(EnumScopeType.QUEUE, { context: EnumMemberQueue.SCAN_EXPIRED, async: true })
  async handle(): Promise<void> {
    this.logger.log(`${this.topic}:v${this.version} is handling...`)

    const state = await this.scanner.scan<QueueCursor>(this.topic, this.version)
    const nowDate = this.helperService.dateNow()

    const expiryMembers = await this.prisma.member.findMany({
      where: { expiryDate: { lte: nowDate } },
      cursor: state.lastId ? { id: state.lastId } : undefined,
      select: { id: true, personalAmount: true, referralAmount: true, expiryDate: true },
      take: 500,
    })

    const memberIds = expiryMembers.map(i => i.id)
    if (!memberIds.length) {
      // reset cursor to start over next time.
      this.logger.log(`${this.topic}:v${this.version} completed`)
      await this.scanner.reset(this.topic, this.version)
      return
    }

    // handle job
    for (const member of expiryMembers) {
      await this.producer.publish(EnumMemberQueue.PROCESS_EXPIRED, {
        version: this.version,
        exclusive: false,
        autoDelete: true,
        priority: EnumQueuePriority.HIGH,
        startDate: nowDate,
        message: {
          memberId: member.id,
        },
      })
    }

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
