import { EnumMemberEvent } from '../enums/member.enum'
import { TMember } from '../interfaces/member.interface'

export class MemberCreatedEvent {
  topic: string = EnumMemberEvent.CREATED
  version: number = 1
  occurredAt: Date = new Date()

  constructor(public readonly payload: TMember) {}
}
