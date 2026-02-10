import { IDomainEvent } from 'lib/nest-core/interfaces/bus.interface'
import { EnumMemberEvent } from '../enums/member.enum'
import { TMember } from '../interfaces/member.interface'

export class MemberRenewalEvent implements IDomainEvent<TMember> {
  topic: string = EnumMemberEvent.RENEWAL
  version: number = 1

  constructor(public readonly payload: TMember) {}
}
