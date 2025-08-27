import { Module } from '@nestjs/common'
import { PointHistoryService } from './services'

@Module({
  providers: [PointHistoryService],
  exports: [PointHistoryService],
  imports: [],
})
export class PointHistoryModule {}
