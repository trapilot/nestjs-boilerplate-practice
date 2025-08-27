import { PickType } from '@nestjs/swagger'
import { MemberResponseDetailDto } from './member.response.detail.dto'

export class MemberPayloadResponseDto extends PickType(MemberResponseDetailDto, [
  'id',
  'code',
  'email',
  'phone',
] as const) {}
