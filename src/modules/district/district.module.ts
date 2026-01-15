import { Module } from '@nestjs/common'
import { DistrictService } from './services'

@Module({
  providers: [DistrictService],
  exports: [DistrictService],
  imports: [],
})
export class DistrictModule {}
