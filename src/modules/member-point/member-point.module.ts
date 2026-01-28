import { Module } from '@nestjs/common'
import { MemberPointService } from './services'

@Module({
  providers: [MemberPointService],
  exports: [MemberPointService],
  imports: [],
})
export class MemberPointModule {}
