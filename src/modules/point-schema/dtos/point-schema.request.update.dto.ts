import { OmitType } from '@nestjs/swagger'
import { PointSchemaRequestCreateDto } from './point-schema.request.create.dto'

export class PointSchemaRequestUpdateDto extends OmitType(PointSchemaRequestCreateDto, []) {
}
