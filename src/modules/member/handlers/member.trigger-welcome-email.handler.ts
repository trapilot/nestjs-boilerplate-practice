import { Injectable } from '@nestjs/common'
import { EnumScopeType, IQueueHandler, LoggerService, OnScope } from 'lib/nest-core'
import { EnumMemberQueue } from '../enums/member.enum'
import { TMember } from '../interfaces/member.interface'

@Injectable()
export class MemberTriggerWelcomeEmailHandler implements IQueueHandler {
  topic: string = EnumMemberQueue.TRIGGER_WELCOME_EMAIL
  version: number = 1

  constructor(private readonly logger: LoggerService) {}

  @OnScope(EnumScopeType.QUEUE, {
    context: EnumMemberQueue.TRIGGER_WELCOME_EMAIL,
    async: true,
  })
  async handle(member: TMember): Promise<void> {
    this.logger.log(`${this.topic}:v${this.version} is handling...`)
    this.logger.log(`Sending email to member: ${member.id}`)
  }
}
