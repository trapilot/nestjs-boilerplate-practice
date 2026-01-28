import { OmitType } from '@nestjs/swagger'
import { MemberTierRequestCreateDto } from './member-tier.request.create.dto'

export class MemberTierRequestUpdateDto extends OmitType(MemberTierRequestCreateDto, []) {}
