import { Module } from '@nestjs/common'
import { DashboardService } from './services'

@Module({
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
