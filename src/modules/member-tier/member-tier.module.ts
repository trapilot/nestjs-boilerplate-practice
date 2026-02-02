import { Module } from '@nestjs/common'
import { TierModule } from 'modules/tier/tier.module'
import { MemberTierService } from './services/member-tier.service'

@Module({
  providers: [MemberTierService],
  exports: [MemberTierService],
  imports: [TierModule],
})
export class MemberTierModule {}
