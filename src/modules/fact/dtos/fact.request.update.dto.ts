import { OmitType } from '@nestjs/swagger'
import { FactRequestCreateDto } from './fact.request.create.dto'

export class FactRequestUpdateDto extends OmitType(FactRequestCreateDto, ['type'] as const) {}
