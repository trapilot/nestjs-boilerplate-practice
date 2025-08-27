import { TMember } from '../interfaces'

export class MemberCreatedEvent {
  member: TMember

  static eventPath = 'member.event.created'
  constructor(member: TMember) {
    this.member = member
  }
}
