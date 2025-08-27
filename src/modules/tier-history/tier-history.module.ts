import { Module } from '@nestjs/common'
import { TierHistoryService } from './services'

@Module({
  providers: [TierHistoryService],
  exports: [TierHistoryService],
  imports: [],
})
export class TierHistoryModule {}
