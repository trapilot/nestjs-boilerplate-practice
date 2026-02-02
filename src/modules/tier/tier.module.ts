import { Module } from '@nestjs/common'
import { TierService } from './services/tier.service'

@Module({
  providers: [TierService],
  exports: [TierService],
  imports: [],
})
export class TierModule {}
