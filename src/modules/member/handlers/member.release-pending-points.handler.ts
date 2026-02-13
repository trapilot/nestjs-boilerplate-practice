import { Injectable } from '@nestjs/common'
import {
  EnumScopeType,
  HelperService,
  IQueueHandler,
  LoggerService,
  OnScope,
  QueueScanner,
} from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { EnumMemberQueue } from '../enums/member.enum'
import { MemberService } from '../services/member.service'

@Injectable()
export class MemberReleasePendingPointHandler implements IQueueHandler {
  topic: string = EnumMemberQueue.RELEASE_PENDING_POINTS
  version: number = 1

  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly scanner: QueueScanner,
    private readonly helperService: HelperService,
    private readonly memberService: MemberService,
  ) {}

  @OnScope(EnumScopeType.QUEUE, { context: EnumMemberQueue.RELEASE_PENDING_POINTS, async: true })
  async handle(): Promise<void> {
    this.logger.log(`${this.topic}:v${this.version} is handling...`)

    const nowDate = this.helperService.dateNow()

    await this.scanner.runWithCursor({
      topic: this.topic,
      version: this.version,

      retrieve: async state => {
        return await this.prisma.memberPoint.findMany({
          where: {
            isPending: true,
            isDeleted: false,
            releaseDate: { lte: nowDate, not: null },
            member: { isActive: true },
          },
          cursor: state.lastId ? { id: state.lastId } : undefined,
          orderBy: [{ releaseDate: 'asc' }],
          select: { id: true },
          take: 50,
        })
      },

      process: async memberPoints => {
        const ids = memberPoints.map(i => i.id)
        await this.memberService.releasePendingPoints(ids)
      },

      getLastId: items => items[items.length - 1]?.id,
    })
  }
}
