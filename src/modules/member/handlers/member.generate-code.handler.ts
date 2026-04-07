import { Injectable } from '@nestjs/common'
import { EnumScopeType, IWorkerHandler, LoggerService, OnScope } from 'lib/nest-core'
import { EnumMemberQueue } from '../enums/member.enum'
import { IMemberGenerateCodePayload } from '../interfaces/member.interface'
import { MemberService } from '../services/member.service'
import { MEMBER_QUEUE_PROC_VERSION } from '../constants/member.constant'

@Injectable()
export class MemberGenerateCodeHandler implements IWorkerHandler {
  topic: string = EnumMemberQueue.PROC_GENERATE_CODE
  version: number = MEMBER_QUEUE_PROC_VERSION[EnumMemberQueue.PROC_GENERATE_CODE]

  constructor(
    private readonly logger: LoggerService,
    private readonly memberService: MemberService,
  ) {}

  @OnScope(EnumScopeType.QUEUE, {
    context: EnumMemberQueue.PROC_GENERATE_CODE,
  })
  async handle(version: number, payload: IMemberGenerateCodePayload): Promise<void> {
    this.logger.log(`${this.topic}:v${version} is handling...`)

    // handle job
    await this.memberService.generateMembershipCode(payload.memberId, payload.issuedAt)
  }
}
