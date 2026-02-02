import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { MEMBER_TIER_DOC_OPERATION } from '../constants/member-tier.doc.constant'
import { MemberTierService } from '../services/member-tier.service'

@ApiTags(MEMBER_TIER_DOC_OPERATION)
@Controller({ version: '1', path: '/member-tiers' })
export class MemberTierAppController {
  constructor(protected readonly tierHistoryService: MemberTierService) {}
}
