import { Module } from '@nestjs/common'
import { MemberTierService } from './services'

@Module({
  providers: [MemberTierService],
  exports: [MemberTierService],
  imports: [],
})
export class MemberTierModule {}
