import { Module } from '@nestjs/common'
import { MemberPointService } from './services/member-point.service'

@Module({
  providers: [MemberPointService],
  exports: [MemberPointService],
  imports: [],
})
export class MemberPointModule {}
