import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { POINT_SCHEMA_DOC_OPERATION } from '../constants/point-schema.doc.constant'
import { PointSchemaService } from '../services/point-schema.service'

@ApiTags(POINT_SCHEMA_DOC_OPERATION)
@Controller({ version: '1', path: '/point-schemas' })
export class PointSchemaAppController {
  constructor(protected readonly pointSchemaService: PointSchemaService) {}
}
