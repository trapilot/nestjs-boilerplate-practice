import { EnumMemberEvent } from '../enums/member.enum'
import { TMember } from '../interfaces/member.interface'

export class MemberRenewalEvent {
  topic: string = EnumMemberEvent.RENEWAL
  version: number = 1

  constructor(public readonly payload: TMember) {}
}
