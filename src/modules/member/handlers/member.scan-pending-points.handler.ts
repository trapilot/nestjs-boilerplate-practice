import { Injectable } from '@nestjs/common'
import {
  EnumQueuePriority,
  EnumScopeType,
  HelperService,
  IWorkerHandler,
  LoggerService,
  OnScope,
  WorkerProducer,
  WorkerScanner,
} from 'lib/nest-core'
import { MEMBER_QUEUE_PROC_VERSION, MEMBER_QUEUE_SCAN_VERSION } from '../constants/member.constant'
import { EnumMemberQueue } from '../enums/member.enum'
import { MemberService } from '../services/member.service'

@Injectable()
export class MemberScanPendingPointHandler implements IWorkerHandler {
  topic: string = EnumMemberQueue.SCAN_PENDING_POINTS
  version: number = MEMBER_QUEUE_SCAN_VERSION[EnumMemberQueue.SCAN_PENDING_POINTS]

  constructor(
    private readonly logger: LoggerService,
    private readonly scanner: WorkerScanner,
    private readonly producer: WorkerProducer,
    private readonly helperService: HelperService,
    private readonly memberService: MemberService,
  ) {}

  @OnScope(EnumScopeType.QUEUE, {
    context: EnumMemberQueue.SCAN_PENDING_POINTS,
  })
  async handle(version: number): Promise<void> {
    this.logger.log(`${this.topic}:v${version} is handling...`)

    const nowDate = this.helperService.dateNow()

    await this.scanner.runWithCursor({
      topic: this.topic,
      version: this.version,
      chunking: 50,

      retrieve: async state => await this.memberService.scanPendingPoints(state.lastId, nowDate),

      process: async memberPointIds => {
        await this.producer.publish(EnumMemberQueue.PROC_PENDING_POINTS, {
          version: MEMBER_QUEUE_PROC_VERSION[EnumMemberQueue.PROC_PENDING_POINTS],
          priority: EnumQueuePriority.HIGH,
          startDate: nowDate,
          message: {
            ids: memberPointIds,
          },
        })

        return memberPointIds[memberPointIds.length - 1]
      },
    })
  }
}
