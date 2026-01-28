import { OmitType } from '@nestjs/swagger'
import { MemberRedemptionRequestCreateDto } from './member-redemption.request.create.dto'

export class MemberRedemptionRequestUpdateDto extends OmitType(
  MemberRedemptionRequestCreateDto,
  [],
) {}
