import { Module } from '@nestjs/common'
import { DashboardService } from './services/dashboard.service'

@Module({
  providers: [DashboardService],
  exports: [DashboardService],
  imports: [],
})
export class DashboardModule {}
