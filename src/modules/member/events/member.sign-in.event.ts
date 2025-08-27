export class MemberSignInEvent {
  memberId: number
  memberToken: string

  static eventPath = 'member.event.sign-in'
  constructor(memberId: number, memberToken: string) {
    this.memberId = memberId
    this.memberToken = memberToken
  }
}
