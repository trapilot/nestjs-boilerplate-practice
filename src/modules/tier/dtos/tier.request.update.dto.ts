import { OmitType } from '@nestjs/swagger'
import { TierRequestCreateDto } from './tier.request.create.dto'

export class TierRequestUpdateDto extends OmitType(TierRequestCreateDto, ['code']) {}
