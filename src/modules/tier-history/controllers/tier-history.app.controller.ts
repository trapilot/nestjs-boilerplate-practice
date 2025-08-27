import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { TIER_HISTORY_DOC_OPERATION } from '../constants'
import { TierHistoryService } from '../services'

@ApiTags(TIER_HISTORY_DOC_OPERATION)
@Controller({ version: '1', path: '/tier-histories' })
export class TierHistoryAppController {
  constructor(protected readonly tierHistoryService: TierHistoryService) {}
}
