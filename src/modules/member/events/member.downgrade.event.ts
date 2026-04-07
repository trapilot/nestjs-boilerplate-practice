import { EnumMemberEvent } from '../enums/member.enum'
import { TMember } from '../interfaces/member.interface'

export class MemberDowngradeEvent {
  topic: string = EnumMemberEvent.DOWNGRADE
  version: number = 1

  constructor(public readonly payload: TMember) {}
}
