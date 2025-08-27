import { OmitType } from '@nestjs/swagger'
import { MemberRequestCreateDto } from './member.request.create.dto'

export class MemberRequestSignUpDto extends OmitType(MemberRequestCreateDto, [
  'isActive',
] as const) {}
