import { OmitType } from '@nestjs/swagger'
import { PointHistoryRequestCreateDto } from './point-history.request.create.dto'

export class PointHistoryRequestUpdateDto extends OmitType(PointHistoryRequestCreateDto, []) {}
