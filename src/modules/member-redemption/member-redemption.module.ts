import { Module } from '@nestjs/common'
import { MemberRedemptionService } from './services'

@Module({
  providers: [MemberRedemptionService],
  exports: [MemberRedemptionService],
  imports: [],
})
export class MemberRedemptionModule {}
