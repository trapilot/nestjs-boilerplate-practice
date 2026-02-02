import { Module } from '@nestjs/common'
import { MemberRedemptionService } from './services/member-redemption.service'

@Module({
  providers: [MemberRedemptionService],
  exports: [MemberRedemptionService],
  imports: [],
})
export class MemberRedemptionModule {}
