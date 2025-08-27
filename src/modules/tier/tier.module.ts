import { Module } from '@nestjs/common'
import { TierService } from './services'

@Module({
  providers: [TierService],
  exports: [TierService],
  imports: [],
})
export class TierModule {}
