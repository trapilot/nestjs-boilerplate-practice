import { Injectable } from '@nestjs/common'
import { EnumScopeType, IWorkerHandler, LoggerService, OnScope } from 'lib/nest-core'
import { MEMBER_QUEUE_PROC_VERSION } from '../constants/member.constant'
import { EnumMemberQueue } from '../enums/member.enum'
import { TMember } from '../interfaces/member.interface'

@Injectable()
export class MemberEmailWelcomeHandler implements IWorkerHandler {
  topic: string = EnumMemberQueue.PROC_EMAIL_WELCOME
  version: number = MEMBER_QUEUE_PROC_VERSION[EnumMemberQueue.PROC_EMAIL_WELCOME]

  constructor(private readonly logger: LoggerService) {}

  @OnScope(EnumScopeType.QUEUE, {
    context: EnumMemberQueue.PROC_EMAIL_WELCOME,
  })
  async handle(version: number, member: TMember): Promise<void> {
    this.logger.log(`${this.topic}:v${version} is handling...`)

    this.logger.log(`Sending email to member: ${member.id}`)
  }
}
