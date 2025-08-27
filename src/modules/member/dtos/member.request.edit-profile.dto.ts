import { OmitType } from '@nestjs/swagger'
import { MemberRequestSignUpDto } from './member.request.sign-up.dto'

export class MemberEditProfileRequestDto extends OmitType(MemberRequestSignUpDto, [
  'password',
  'avatar',
] as const) {}
