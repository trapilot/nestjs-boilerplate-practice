import { IDomainEvent } from 'lib/nest-core/interfaces/bus.interface'
import { EnumMemberEvent } from '../enums/member.enum'
import { TMember } from '../interfaces/member.interface'

export class MemberDowngradeEvent implements IDomainEvent<TMember> {
  topic: string = EnumMemberEvent.DOWNGRADE
  version: number = 1

  constructor(public readonly payload: TMember) {}
}
