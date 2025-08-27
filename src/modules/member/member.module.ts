import { Module } from '@nestjs/common'
import { TierModule } from '../tier/tier.module'
import { MemberListener } from './listeners'
import { MemberService } from './services'

@Module({
  providers: [MemberListener, MemberService],
  exports: [MemberService],
  imports: [TierModule],
})
export class MemberModule {}
