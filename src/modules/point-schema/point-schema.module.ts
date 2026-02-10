import { Module } from '@nestjs/common'
import { PointSchemaUtil } from './helpers/point-schema.util'
import { PointSchemaService } from './services/point-schema.service'

@Module({
  providers: [PointSchemaService, PointSchemaUtil],
  exports: [PointSchemaService],
  imports: [],
})
export class PointSchemaModule {}
