import { OmitType } from '@nestjs/swagger'
import { TierHistoryRequestCreateDto } from './tier-history.request.create.dto'

export class TierHistoryRequestUpdateDto extends OmitType(TierHistoryRequestCreateDto, []) {}
