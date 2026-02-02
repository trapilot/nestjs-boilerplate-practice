import { Module } from '@nestjs/common'
import { DistrictService } from './services/district.service'

@Module({
  providers: [DistrictService],
  exports: [DistrictService],
  imports: [],
})
export class DistrictModule {}
